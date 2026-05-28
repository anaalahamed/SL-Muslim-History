import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/seo'
import ArticlesClient from './ArticlesClient'

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

export default function ArticlesPage() {
  return <ArticlesClient />
}
