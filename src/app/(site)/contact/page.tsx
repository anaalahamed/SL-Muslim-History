import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME } from '@/lib/seo'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Sri Lanka Muslim History. Submit articles, share historical photographs, report errors, or partner with us to preserve Sri Lankan Muslim heritage.',
  alternates: { canonical: `${BASE_URL}/contact` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/contact`,
    siteName: SITE_NAME,
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Get in touch — submit articles, share photographs, or partner with us.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Get in touch — submit articles, share photographs, or partner with us.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function ContactPage() {
  return <ContactClient />
}
