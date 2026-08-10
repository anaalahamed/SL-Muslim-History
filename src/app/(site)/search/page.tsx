import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { BASE_URL, SITE_NAME } from '@/lib/seo'
import { getAds } from '@/lib/db/ads'
import SearchClient from './SearchClient'

// The search results themselves depend on the ?q= query and stay
// client-fetched (interactive, changes without a full navigation), but
// the "banner" AdBanner doesn't depend on the query at all — PageSpeed
// traced this page's poor LCP to exactly that ad being client-only and
// lazy-loaded despite sitting above the fold, same as every other
// listing page fixed this session. unstable_cache keeps this route
// statically generated with 1-minute ISR instead of becoming dynamic.
const getCachedSearchBannerAds = unstable_cache(
  () => getAds('banner'),
  ['search-page-banner-ads'],
  { revalidate: 60 },
)

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search articles, news, and historical content about Sri Lankan Muslim history, culture, and heritage.',
  alternates: { canonical: `${BASE_URL}/search` },
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/search`,
    siteName: SITE_NAME,
    title: `Search | ${SITE_NAME}`,
    description: 'Search articles and news about Sri Lankan Muslim history.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Search | ${SITE_NAME}`,
    description: 'Search articles and news about Sri Lankan Muslim history.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default async function SearchPage() {
  const bannerAds = await getCachedSearchBannerAds()
  return <SearchClient initialBannerAds={bannerAds} />
}
