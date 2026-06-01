import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import MaintenanceGate from '@/components/layout/MaintenanceGate'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import BreakingTicker from '@/components/layout/BreakingTicker'
import SidePanelAd from '@/components/layout/SidePanelAd'

// Footer is large — split from initial bundle
const Footer = dynamic(() => import('@/components/layout/Footer'))

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaintenanceGate>
      <GoogleAnalytics />
      <AnnouncementBanner />
      <Header />
      {/* Reserve 36px so layout doesn't shift when ticker data arrives */}
      <Suspense fallback={<div style={{ height: '36px', background: 'var(--green-dark)' }} />}>
        <BreakingTicker />
      </Suspense>

      {/*
        Portal layout: side ad columns flank the main content.
        Side columns are hidden below 1620px (CSS .portal-side media query)
        so tablets and phones see the normal single-column layout.
      */}
      <div className="portal-outer flex-1">
        <aside className="portal-side portal-side--left" aria-label="Left advertisement">
          <SidePanelAd position="left-panel" />
        </aside>

        <main className="portal-main">
          {children}
        </main>

        <aside className="portal-side portal-side--right" aria-label="Right advertisement">
          <SidePanelAd position="right-panel" />
        </aside>
      </div>

      <Footer />
    </MaintenanceGate>
  )
}
