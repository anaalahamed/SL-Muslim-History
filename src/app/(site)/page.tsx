import HeroSlider from '@/components/home/HeroSlider'
import SpecialNews from '@/components/home/SpecialNews'
import FeaturedArticle from '@/components/home/FeaturedArticle'
import AllArticles from '@/components/home/AllArticles'
import JanazaNews from '@/components/home/JanazaNews'
import MostRead from '@/components/home/MostRead'
import CategoryGrid from '@/components/home/CategoryGrid'
import SidebarAd from '@/components/home/SidebarAd'
import DonationCTA from '@/components/home/DonationCTA'

export default function HomePage() {
  return (
    <>
      {/* ONE SINGLE CONTAINER — no separate sections, no double padding gaps */}
      <div style={{ padding: '10px 14px 14px', background: 'var(--bg)' }}>
        <div className="home-content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: '12px' }}>

          {/* LEFT COLUMN: Slider → Featured Articles → All Articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <HeroSlider />
            <FeaturedArticle />
            <AllArticles />
          </div>

          {/* RIGHT SIDEBAR: Special News → Ad → Janaza News → Most Read → Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'start' }}>
            <SpecialNews />
            <SidebarAd />
            <JanazaNews />
            <MostRead />
            <CategoryGrid />
          </div>

        </div>
      </div>

      <DonationCTA />
    </>
  )
}
