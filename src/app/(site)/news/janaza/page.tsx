import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import { getAllNewsByType } from '@/lib/db/news'
import { getAds } from '@/lib/db/ads'
import NewsTypeClient from '../NewsTypeClient'

// unstable_cache keeps this route statically generated with 1-minute ISR
// instead of becoming fully dynamic — see the same pattern's comment in
// articles/page.tsx for why (Supabase's client forces cache:'no-store').
const getCachedJanazaData = unstable_cache(
  async () => {
    const [news, bannerAds] = await Promise.all([
      getAllNewsByType('janaza'),
      getAds('banner'),
    ])
    return { news, bannerAds }
  },
  ['janaza-news-page-data'],
  { revalidate: 60 },
)

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

export default async function JanazaNewsPage() {
  const { news, bannerAds } = await getCachedJanazaData()
  return (
    <NewsTypeClient
      newsType="janaza"
      badge="Janaza News"
      title="ஜனாஸா செய்திகள்"
      subtitle="Janaza notices and funeral announcements from Sri Lanka's Muslim community."
      initialNews={news}
      initialBannerAds={bannerAds}
    />
  )
}
