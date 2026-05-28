import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import HeroSlider from '@/components/home/HeroSlider'
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/seo'

export const metadata: Metadata = {
  title: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
    description: SITE_DESCRIPTION,
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
    description: SITE_DESCRIPTION,
    images: [`${BASE_URL}/og-image.jpg`],
  },
}
import SpecialNews from '@/components/home/SpecialNews'
import FeaturedArticle from '@/components/home/FeaturedArticle'
import AllArticles from '@/components/home/AllArticles'
import SidebarAd from '@/components/home/SidebarAd'

// Below-fold components lazy-loaded to reduce initial JS bundle size
const JanazaNews   = dynamic(() => import('@/components/home/JanazaNews'))
const MostRead     = dynamic(() => import('@/components/home/MostRead'))
const FollowUs     = dynamic(() => import('@/components/home/FollowUs'))
const CategoryGrid = dynamic(() => import('@/components/home/CategoryGrid'))
const DonationCTA  = dynamic(() => import('@/components/home/DonationCTA'))

export default function HomePage() {
  return (
    <>
      <div style={{ padding: '10px 14px 14px', background: 'var(--bg)' }}>
        <div className="home-content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: '12px' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <HeroSlider />
            <FeaturedArticle />
            <AllArticles />
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'start' }}>
            <SpecialNews />
            <SidebarAd />
            <JanazaNews />
            <MostRead />
            <FollowUs />
            <CategoryGrid />
          </div>

        </div>
      </div>

      <DonationCTA />
    </>
  )
}
