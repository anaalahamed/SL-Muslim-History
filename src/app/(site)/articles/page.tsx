import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/seo'
import { getArticles } from '@/lib/db/articles'
import { getCategories } from '@/lib/db/categories'
import { getAds } from '@/lib/db/ads'
import ArticlesClient from './ArticlesClient'

// unstable_cache (same pattern as BreakingTicker/AnnouncementBanner) lets
// this page keep its static generation + 1-minute ISR revalidation
// instead of becoming fully dynamic — Supabase's client forces
// cache:'no-store' on every request, which would otherwise force this
// route to server-render on every single visit.
const getCachedArticlesPageData = unstable_cache(
  async () => {
    const [articles, categories, bannerAds] = await Promise.all([
      getArticles(),
      getCategories(),
      getAds('banner'),
    ])
    return { articles, categories, bannerAds }
  },
  ['articles-page-data'],
  { revalidate: 60 },
)

export const metadata: Metadata = {
  title: 'Articles',
  description: `Browse all articles on Sri Lankan Muslim history, culture, heritage, and traditions. ${SITE_DESCRIPTION}`,
  keywords: SITE_KEYWORDS,
  alternates: { canonical: `${BASE_URL}/articles` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/articles`,
    siteName: SITE_NAME,
    title: 'Articles | Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு',
    description: `Browse all articles on Sri Lankan Muslim history, culture, heritage, and traditions.`,
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles | Sri Lanka Muslim History',
    description: `Browse all articles on Sri Lankan Muslim history, culture, heritage, and traditions.`,
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default async function ArticlesPage() {
  // Fetched server-side so the article list and banner ad are present in
  // the initial HTML instead of the whole page starting empty and
  // client-fetching everything after hydration — PageSpeed traced this
  // page's poor LCP to the banner ad specifically being client-only and
  // lazy-loaded despite sitting above the fold.
  const { articles, categories, bannerAds } = await getCachedArticlesPageData()

  return <ArticlesClient initialArticles={articles} initialCategories={categories} initialBannerAds={bannerAds} />
}
