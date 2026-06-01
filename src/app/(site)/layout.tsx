import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import MaintenanceGate from '@/components/layout/MaintenanceGate'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import BreakingTicker from '@/components/layout/BreakingTicker'
import SidePanelAd from '@/components/layout/SidePanelAd'

const Footer = dynamic(() => import('@/components/layout/Footer'))

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaintenanceGate>
      {/*
        Portal structure:
          [left-ad 168px] | [portal-center flex-col] | [right-ad 168px]

        portal-center contains the ENTIRE site: announcement → header →
        ticker → page content → footer. This makes every element share
        exactly the same width so nothing appears wider or narrower than
        its neighbours. Side panels are genuine siblings outside the
        content box. Below 1440px portal-side is display:none, so the
        layout is identical to the pre-portal design on all phones/tablets.
      */}
      <div className="portal-outer flex-1">

        <aside className="portal-side portal-side--left" aria-label="Left advertisement">
          <SidePanelAd position="left-panel" />
        </aside>

        {/* ── Entire site content — header → footer ── */}
        <div className="portal-center">
          <GoogleAnalytics />
          <AnnouncementBanner />
          <Header />
          {/* Reserve 36px so layout doesn't shift when ticker data arrives */}
          <Suspense fallback={<div style={{ height: '36px', background: 'var(--green-dark)' }} />}>
            <BreakingTicker />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>

        <aside className="portal-side portal-side--right" aria-label="Right advertisement">
          <SidePanelAd position="right-panel" />
        </aside>

      </div>
    </MaintenanceGate>
  )
}
