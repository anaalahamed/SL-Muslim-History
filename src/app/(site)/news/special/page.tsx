import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import NewsTypeClient from '../NewsTypeClient'

export const metadata: Metadata = {
  title: 'சிறப்புச் செய்திகள் | Special News',
  description: 'Latest special news and announcements from the Sri Lankan Muslim community. சிறப்பான நிகழ்வுகள், அறிவிப்புகள் மற்றும் முஸ்லிம் சமுதாயத்தின் புதிய செய்திகள்.',
  keywords: [
    'Special News Sri Lanka Muslims',
    'சிறப்புச் செய்திகள்',
    'Sri Lanka Muslim Special Announcements',
    'Muslim Community News Sri Lanka',
    'இலங்கை முஸ்லிம் சிறப்பு செய்திகள்',
    ...SITE_KEYWORDS.slice(0, 10),
  ],
  alternates: { canonical: `${BASE_URL}/news/special` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/news/special`,
    siteName: SITE_NAME,
    title: 'சிறப்புச் செய்திகள் | Special News | Sri Lanka Muslim History',
    description: 'Latest special news and announcements from the Sri Lankan Muslim community.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'சிறப்புச் செய்திகள் | Special News | Sri Lanka Muslim History',
    description: 'Latest special news and announcements from the Sri Lankan Muslim community.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function SpecialNewsPage() {
  return (
    <NewsTypeClient
      newsType="special"
      badge="Special News"
      title="சிறப்புச் செய்திகள்"
      subtitle="Special announcements, community updates, and notable news from Sri Lanka's Muslim community."
    />
  )
}
