import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import { getAllNewsByType } from '@/lib/db/news'
import { getAds } from '@/lib/db/ads'
import NewsTypeClient from '../NewsTypeClient'

// unstable_cache keeps this route statically generated with 1-minute ISR
// instead of becoming fully dynamic — see the same pattern's comment in
// articles/page.tsx for why (Supabase's client forces cache:'no-store').
const getCachedSpecialData = unstable_cache(
  async () => {
    const [news, bannerAds] = await Promise.all([
      getAllNewsByType('special'),
      getAds('banner'),
    ])
    return { news, bannerAds }
  },
  ['special-news-page-data'],
  { revalidate: 60 },
)

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

export default async function SpecialNewsPage() {
  const { news, bannerAds } = await getCachedSpecialData()
  return (
    <NewsTypeClient
      newsType="special"
      badge="Special News"
      title="சிறப்புச் செய்திகள்"
      subtitle="Special announcements, community updates, and notable news from Sri Lanka's Muslim community."
      initialNews={news}
      initialBannerAds={bannerAds}
    />
  )
}
