import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Us | Sri Lanka Muslim History',
  description: `Learn about Sri Lanka Muslim History — our mission to preserve 1,400 years of Sri Lankan Muslim heritage, culture, and traditions. ${SITE_DESCRIPTION}`,
  alternates: { canonical: `${BASE_URL}/about` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/about`,
    siteName: SITE_NAME,
    title: `About Us | ${SITE_NAME} | இலங்கை முஸ்லிம்களின் வரலாறு`,
    description: 'Preserving 1,400 years of Sri Lanka Muslim history, culture, and heritage for future generations.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About Us | ${SITE_NAME}`,
    description: 'Preserving 1,400 years of Sri Lanka Muslim history, culture, and heritage.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function AboutPage() {
  return <AboutClient />
}
