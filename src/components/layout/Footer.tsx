import { unstable_cache } from 'next/cache'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { defaultConfig } from '@/lib/adminConfig'
import FooterClient from './FooterClient'

const SOCIAL_KEYS = ['facebook', 'youtube', 'whatsapp', 'twitter', 'instagram', 'telegram', 'reddit', 'pinterest'] as const

// Same unstable_cache pattern as BreakingTicker/AnnouncementBanner/SidePanelAd:
// the stats strip and social links used to start empty/default on the client
// and pop in once mergeSharedConfigFromSupabase resolved — a real, confirmed
// contributor to the footer's large layout shift on PageSpeed mobile tests.
// Fetching this on the server means the footer arrives in the initial HTML
// already in its final shape. Only plain strings/booleans cross the
// server->client boundary here — the icon SVGs stay in FooterClient, keyed
// by platform name, since passing JSX elements nested inside a plain data
// array through this boundary isn't reliable.
const getCachedFooterConfig = unstable_cache(
  async () => {
    const settings = await getSiteSettings()
    return {
      stats: settings?.stats && settings.stats.length > 0 ? settings.stats : defaultConfig.stats,
      activeSocial: Object.fromEntries(
        SOCIAL_KEYS.map((key) => [key, settings?.[key] || ''])
      ) as Record<typeof SOCIAL_KEYS[number], string>,
    }
  },
  ['footer-config'],
  { revalidate: 60 },
)

export default async function Footer() {
  const { stats, activeSocial } = await getCachedFooterConfig()
  return <FooterClient stats={stats} activeSocial={activeSocial} />
}
