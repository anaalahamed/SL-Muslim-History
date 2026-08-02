import { unstable_cache } from 'next/cache'
import { getAds } from '@/lib/db/ads'
import SidePanelAdClient from './SidePanelAdClient'

interface Props {
  position: 'left-panel' | 'right-panel'
}

// Same unstable_cache pattern as BreakingTicker/AnnouncementBanner: lets this
// be fetched and rendered on the server (present in the very first paint, no
// client pop-in) without forcing every page under the shared layout into
// fully dynamic rendering. This is the desktop-only left/right ad column —
// on real PageSpeed testing it was the single biggest source of layout
// shift on desktop (it used to start empty and pop in after a client fetch,
// same class of bug already fixed for the announcement banner and footer).
const getCachedAds = unstable_cache(
  (position: 'left-panel' | 'right-panel') => getAds(position),
  ['side-panel-ads'],
  { revalidate: 60 },
)

export default async function SidePanelAd({ position }: Props) {
  const ads = await getCachedAds(position)
  if (ads.length === 0) return null
  return <SidePanelAdClient ads={ads} />
}
