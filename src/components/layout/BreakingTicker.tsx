import { unstable_cache } from 'next/cache'
import { getSpecialNews } from '@/lib/db/news'
import TickerTrack from './TickerTrack'

// Cache the ticker content for 5 minutes — avoids a Supabase round-trip on every page view
const getCachedTicker = unstable_cache(
  () => getSpecialNews(6),
  ['breaking-ticker'],
  { revalidate: 300 },
)

export default async function BreakingTicker() {
  const specialNews = await getCachedTicker()
  if (specialNews.length === 0) return null

  return (
    <div
      className="flex items-center overflow-hidden"
      style={{ background: 'var(--green-dark)', height: '36px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Label */}
      <div
        className="flex-shrink-0 px-4 h-full flex items-center gap-2 font-bold text-xs z-10"
        style={{
          background: 'var(--red, #c0392b)',
          color: 'white',
          minWidth: '110px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <span className="animate-pulse" style={{ fontSize: '8px' }}>●</span>
        Special
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '100%', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Scrolling text — TickerTrack is a Client Component that measures
          the actual rendered width and sets the exact pixel shift via CSS
          custom properties, guaranteeing a seamless infinite loop on any
          viewport with any number of headlines. */}
      <div className="flex-1 overflow-hidden" style={{ paddingLeft: '12px', position: 'relative' }}>
        <TickerTrack items={specialNews.map(n => ({ id: n.id, title: n.title }))} />
      </div>
    </div>
  )
}
