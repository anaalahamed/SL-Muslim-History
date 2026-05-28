import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME } from '@/lib/seo'
import SearchClient from './SearchClient'

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
}

export default function SearchPage() {
  return <SearchClient />
}
