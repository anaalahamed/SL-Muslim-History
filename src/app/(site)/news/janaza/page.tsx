import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import NewsTypeClient from '../NewsTypeClient'

export const metadata: Metadata = {
  title: 'Janaza News | ஜனாஸா செய்திகள்',
  description: 'Latest Janaza news and funeral notices from the Sri Lankan Muslim community. ஜனாஸா அறிவிப்புகள் மற்றும் இலங்கை முஸ்லிம் சமுதாயத்தின் மறைவு செய்திகள்.',
  keywords: [
    'Janaza News Sri Lanka',
    'ஜனாஸா செய்திகள்',
    'Muslim Funeral Notices Sri Lanka',
    'Sri Lanka Janaza Announcements',
    'இலங்கை முஸ்லிம் ஜனாஸா',
    'Muslim Death Notices Sri Lanka',
    ...SITE_KEYWORDS.slice(0, 10),
  ],
  alternates: { canonical: `${BASE_URL}/news/janaza` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/news/janaza`,
    siteName: SITE_NAME,
    title: 'Janaza News | ஜனாஸா செய்திகள் | Sri Lanka Muslim History',
    description: 'Latest Janaza news and funeral notices from the Sri Lankan Muslim community.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Janaza News | ஜனாஸா செய்திகள் | Sri Lanka Muslim History',
    description: 'Latest Janaza news and funeral notices from the Sri Lankan Muslim community.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function JanazaNewsPage() {
  return (
    <NewsTypeClient
      newsType="janaza"
      badge="Janaza News"
      title="ஜனாஸா செய்திகள்"
      subtitle="Janaza notices and funeral announcements from Sri Lanka's Muslim community."
    />
  )
}
