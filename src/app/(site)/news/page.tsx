import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import NewsClient from './NewsClient'

export const metadata: Metadata = {
  title: 'News & Updates | Sri Lanka Muslim History',
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

export default function NewsPage() {
  return <NewsClient />
}
