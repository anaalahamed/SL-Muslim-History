import { unstable_cache } from 'next/cache'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { Announcement } from '@/lib/adminConfig'
import AnnouncementBannerClient from './AnnouncementBannerClient'

// Cached the same way BreakingTicker caches special news — this lets the
// banner be fetched and rendered on the server (no client pop-in / layout
// shift once loaded) without forcing every page that renders it to become
// fully dynamic, since unstable_cache decouples the fetch from per-request
// rendering instead of making it a live no-store call.
const getCachedAnnouncement = unstable_cache(
  async (): Promise<Announcement> => {
    const settings = await getSiteSettings()
    return settings?.announcement ?? { enabled: false, text: '', link: '', color: 'green' }
  },
  ['announcement-banner'],
  { revalidate: 60 },
)

export default async function AnnouncementBanner() {
  const announcement = await getCachedAnnouncement()
  if (!announcement.enabled || !announcement.text) return null
  return <AnnouncementBannerClient announcement={announcement} />
}
