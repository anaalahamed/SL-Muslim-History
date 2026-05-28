import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME } from '@/lib/seo'
import DonateClient from './DonateClient'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support the preservation of Sri Lankan Muslim heritage. Your donation helps us research, document, and share 1,400 years of Muslim history in Sri Lanka.',
  alternates: { canonical: `${BASE_URL}/donate` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/donate`,
    siteName: SITE_NAME,
    title: `Donate | Support ${SITE_NAME}`,
    description: 'Help preserve Sri Lankan Muslim heritage. Support our research, documentation, and digital archive.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Donate | Support ${SITE_NAME}`,
    description: 'Help preserve Sri Lankan Muslim heritage.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function DonatePage() {
  return <DonateClient />
}
