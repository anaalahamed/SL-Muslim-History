import type { Metadata } from 'next'
import lazyLoad from 'next/dynamic'
import HeroSlider from '@/components/home/HeroSlider'
import SpecialNews from '@/components/home/SpecialNews'
import FeaturedArticle from '@/components/home/FeaturedArticle'
import AllArticles from '@/components/home/AllArticles'
import SidebarAd from '@/components/home/SidebarAd'
import AdBanner from '@/components/ui/AdBanner'
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/seo'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { getRecentArticles, getFeaturedArticles, getArticlesPaginated, getMostReadArticles } from '@/lib/db/articles'
import { getSpecialNews, getJanazaNews } from '@/lib/db/news'
import { getSidebarAd, getAds } from '@/lib/db/ads'
import { getCategories } from '@/lib/db/categories'

const SOCIAL_KEYS = ['facebook', 'youtube', 'whatsapp', 'twitter', 'instagram', 'telegram', 'reddit', 'pinterest'] as const

export const dynamic = 'force-dynamic'

// Admin-editable via Settings > SEO — same fallback behavior as before
// when nothing's been saved there yet.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const description = settings?.metaDescription || SITE_DESCRIPTION
  const ogImage = settings?.ogImage || `${BASE_URL}/og-image.jpg`

  return {
    title: { absolute: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு` },
    description,
    keywords: SITE_KEYWORDS,
    alternates: { canonical: BASE_URL },
    openGraph: {
      type: 'website',
      url: BASE_URL,
      siteName: SITE_NAME,
      title: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
      description,
      images: [ogImage],
    },
  }
}

// Below-fold components lazy-loaded to reduce initial JS bundle size
const JanazaNews   = lazyLoad(() => import('@/components/home/JanazaNews'))
const MostRead     = lazyLoad(() => import('@/components/home/MostRead'))
const FollowUs     = lazyLoad(() => import('@/components/home/FollowUs'))
const CategoryGrid = lazyLoad(() => import('@/components/home/CategoryGrid'))
const DonationCTA  = lazyLoad(() => import('@/components/home/DonationCTA'))

const ARTICLES_PER_PAGE = 10

export default async function HomePage() {
  // Fetched server-side so every above-the-fold box (hero, featured,
  // article list, special/janaza news, most read, sidebar ad) is present
  // in the initial HTML instead of each one waiting on its own client-side
  // fetch after hydration.
  const [heroSlides, featured, articlesPage, specialNews, janazaNews, mostRead, sidebarAd, bottomAds, categories, settings] = await Promise.all([
    getRecentArticles(5),
    getFeaturedArticles(),
    getArticlesPaginated(1, ARTICLES_PER_PAGE),
    getSpecialNews(6),
    getJanazaNews(5),
    getMostReadArticles(5),
    getSidebarAd(),
    getAds('homepage-bottom'),
    getCategories(),
    getSiteSettings(),
  ])

  const activeSocial = Object.fromEntries(SOCIAL_KEYS.map((key) => [key, settings?.[key] || '']))

  return (
    <>
      <div style={{ padding: '10px 14px 14px', background: 'var(--bg)' }}>
        <div className="home-content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: '12px' }}>

          {/* LEFT COLUMN */}
          {/* minWidth: 0 is required — grid/flex items default to a min-width
              equal to their content's intrinsic size, so without it a wide
              child (e.g. hero title text) can force this column wider than
              its own grid track, overflowing the viewport on mobile. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
            <HeroSlider slides={heroSlides} />
            <FeaturedArticle articles={featured} />
            <AllArticles initialArticles={articlesPage.articles} initialTotal={articlesPage.total} />
            <AdBanner position="homepage-bottom" initialAds={bottomAds} />
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'start', minWidth: 0 }}>
            <SpecialNews items={specialNews} />
            <SidebarAd ad={sidebarAd} />
            <JanazaNews items={janazaNews} />
            <MostRead articles={mostRead} />
            <FollowUs activeSocial={activeSocial} />
            <CategoryGrid categories={categories} />
          </div>

        </div>
      </div>

      <DonationCTA />
    </>
  )
}
