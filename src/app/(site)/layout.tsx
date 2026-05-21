import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BreakingTicker from '@/components/layout/BreakingTicker'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import MaintenanceGate from '@/components/layout/MaintenanceGate'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaintenanceGate>
      <GoogleAnalytics />
      <AnnouncementBanner />
      <Header />
      <BreakingTicker />
      <main className="flex-1">{children}</main>
      <Footer />
    </MaintenanceGate>
  )
}
