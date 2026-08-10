import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import { getNews } from '@/lib/db/news'
import { getAds } from '@/lib/db/ads'
import NewsClient from './NewsClient'

// unstable_cache keeps this route statically generated with 1-minute ISR
// instead of becoming fully dynamic — see the same pattern's comment in
// articles/page.tsx for why (Supabase's client forces cache:'no-store').
const getCachedNewsPageData = unstable_cache(
  async () => {
    const [news, bannerAds] = await Promise.all([
      getNews(),
      getAds('banner'),
    ])
    return { news, bannerAds }
  },
  ['news-page-data'],
  { revalidate: 60 },
)

export const metadata: Metadata = {
  title: 'News & Updates',
  description: 'Latest news, special announcements, and Janaza news from the Sri Lankan Muslim community. Stay informed about community events, heritage discoveries, and cultural milestones.',
  keywords: ['Janaza News Sri Lanka', 'ஜனாஸா செய்திகள்', 'Sri Lanka Muslim News', 'Special News Sri Lanka Muslims', ...SITE_KEYWORDS.slice(0, 10)],
  alternates: { canonical: `${BASE_URL}/news` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/news`,
    siteName: SITE_NAME,
    title: 'News & Updates | Sri Lanka Muslim History | இலங்கை முஸ்லிம் செய்திகள்',
    description: 'Latest news, special announcements, and Janaza news from the Sri Lankan Muslim community.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News & Updates | Sri Lanka Muslim History',
    description: 'Latest news, special announcements, and Janaza news from the Sri Lankan Muslim community.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default async function NewsPage() {
  const { news, bannerAds } = await getCachedNewsPageData()
  return <NewsClient initialNews={news} initialBannerAds={bannerAds} />
}
