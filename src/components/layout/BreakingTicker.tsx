import { unstable_cache } from 'next/cache'
import { getSpecialNews } from '@/lib/db/news'

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

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden relative" style={{ paddingLeft: '12px' }}>
        <div className="ticker-move flex items-center gap-16" style={{ color: 'rgba(255,255,255,0.88)' }}>
          {[...specialNews, ...specialNews].map((news, i) => (
            <span
              key={i}
              className="tamil-heading flex items-center gap-2 flex-shrink-0 text-sm"
            >
              <span style={{ color: 'var(--gold)', fontSize: '10px' }}>◆</span>
              {news.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
