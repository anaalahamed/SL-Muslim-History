import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import { getCategories } from '@/lib/db/categories'
import { getArticles } from '@/lib/db/articles'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { defaultConfig } from '@/lib/adminConfig'
import CategoryIndexClient from './CategoryIndexClient'

// unstable_cache keeps this route statically generated with 1-minute ISR
// instead of becoming fully dynamic — see the same pattern's comment in
// articles/page.tsx for why (Supabase's client forces cache:'no-store').
const getCachedCategoryIndexData = unstable_cache(
  async () => {
    const [categories, articles, settings] = await Promise.all([
      getCategories(),
      getArticles(),
      getSiteSettings(),
    ])
    return {
      categories,
      totalArticles: articles.length,
      stats: settings?.stats && settings.stats.length > 0 ? settings.stats : defaultConfig.stats,
    }
  },
  ['category-index-page-data'],
  { revalidate: 60 },
)

export const metadata: Metadata = {
  title: 'Browse by Category',
  description: 'Browse all categories of Sri Lankan Muslim history — Early History, Mosques & Places, Culture & Traditions, Notable Figures, Literature & Arts, Community & Society.',
  keywords: ['Sri Lanka Muslim History categories', 'இலங்கை முஸ்லிம் வகைகள்', ...SITE_KEYWORDS.slice(0, 10)],
  alternates: { canonical: `${BASE_URL}/category` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/category`,
    siteName: SITE_NAME,
    title: `Browse Categories | ${SITE_NAME}`,
    description: 'Explore all categories of Sri Lankan Muslim history — covering 1,400 years of heritage, culture, and community.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Browse Categories | ${SITE_NAME}`,
    description: 'Explore all categories of Sri Lankan Muslim history.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default async function CategoryPage() {
  const { categories, totalArticles, stats } = await getCachedCategoryIndexData()
  return <CategoryIndexClient categories={categories} totalArticles={totalArticles} stats={stats} />
}
