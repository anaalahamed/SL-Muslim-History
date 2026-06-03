'use client'

import { useEffect, useRef } from 'react'

type Props = { items: { id: string; title: string }[] }

/**
 * How many times the headline list is repeated in the DOM.
 * 6× guarantees the content strip is always wider than any container,
 * even with just 1 short headline — so the translateX animation never
 * creates a blank gap before the loop restarts.
 */
const REPEAT = 6
const PX_PER_SEC = 80 // target scroll speed

export default function TickerTrack({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // scrollWidth gives the full rendered width including overflow —
    // unaffected by parent overflow:hidden.
    const oneSetPx = el.scrollWidth / REPEAT
    const durS = Math.max(8, Math.round(oneSetPx / PX_PER_SEC))

    el.style.setProperty('--ticker-shift', `-${oneSetPx}px`)
    el.style.setProperty('--ticker-dur', `${durS}s`)
  }, [])

  const repeated = Array.from({ length: REPEAT }, () => items).flat()

  return (
    <div ref={ref} className="ticker-move gap-16" style={{ color: 'rgba(255,255,255,0.88)' }}>
      {repeated.map((item, i) => (
        <span key={i} className="tamil-heading flex items-center gap-2 flex-shrink-0 text-sm">
          <span style={{ color: 'var(--gold)', fontSize: '10px' }}>◆</span>
          {item.title}
        </span>
      ))}
    </div>
  )
}
