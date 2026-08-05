import Header from '@/components/layout/Header'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import MaintenanceGate from '@/components/layout/MaintenanceGate'
import BreakingTicker from '@/components/layout/BreakingTicker'
import SidePanelAd from '@/components/layout/SidePanelAd'
import Footer from '@/components/layout/Footer'

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
          {/* Not Suspense-wrapped (unlike BreakingTicker below, whose fallback
              height matches its real content exactly): this component is
              either absent or has real height, so streaming it in after the
              initial paint would just relocate the same layout-shift bug.
              unstable_cache still keeps this from forcing the route dynamic. */}
          <AnnouncementBanner />
          <Header />
          {/* Not Suspense-wrapped: React/Next.js's streaming SSR marks a
              Suspense boundary's placement with a <template> tag that gets
              removed once streaming completes. Direct measurement (a
              document-wide MutationObserver + PerformanceObserver trace on
              the live site) showed that exact <template> removal firing at
              the same millisecond as window's load event, immediately
              followed by a large layout-shift entry reporting the footer's
              rect as (0,0,0) for one frame — a browser-level quirk of that
              cleanup, unrelated to any real content change (BreakingTicker's
              own fetch is unstable_cache-backed and fast regardless).
              Removing this boundary means the whole page — including the
              ticker — renders as one atomic unit, with no <template>
              marker ever inserted, eliminating the shift outright. */}
          <BreakingTicker />
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
