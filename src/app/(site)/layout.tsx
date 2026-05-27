import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import MaintenanceGate from '@/components/layout/MaintenanceGate'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import BreakingTicker from '@/components/layout/BreakingTicker'

// Footer is large (newsletter form, social links, stats) — split from initial bundle
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
      <main className="flex-1">{children}</main>
      <Footer />
    </MaintenanceGate>
  )
}
