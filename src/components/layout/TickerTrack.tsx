'use client'

import { useEffect, useRef } from 'react'

type Props = { items: { id: string; title: string }[] }

/**
 * Repeating the list 6× ensures the content strip is always wider than
 * any viewport, even when the DB contains only 1 short headline.
 * rAF drives every pixel of movement — no CSS animation used.
 */
const REPEAT = 6
const SPEED_PX_PER_SEC = 60

export default function TickerTrack({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const scrollW  = el.scrollWidth
    const oneSetPx = scrollW / REPEAT

    if (oneSetPx <= 0) return

    // ── Disable CSS animation — rAF owns all movement from here ──────────
    el.style.animation = 'none'

    let pos      = 0
    let lastTime: number | null = null
    let paused   = false
    let rafId:   number

    function tick(now: number) {
      rafId = requestAnimationFrame(tick)
      if (lastTime === null) lastTime = now
      if (!paused) {
        pos -= SPEED_PX_PER_SEC * ((now - lastTime) / 1000)
        if (pos <= -oneSetPx) pos += oneSetPx   // seamless loop: jump by exactly one set
        el!.style.transform = `translateX(${pos}px)`
      }
      lastTime = now
    }

    // Pause on hover (matches the old CSS :hover behaviour)
    const onEnter = () => { paused = true }
    const onLeave = () => { paused = false; lastTime = null }
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [items.length])

  const repeated = Array.from({ length: REPEAT }, () => items).flat()

  return (
    /* animation:none disables the CSS animation before JS runs (SSR/hydration).
       rAF takes over immediately on mount via useEffect above. */
    <div
      ref={trackRef}
      className="ticker-move gap-16"
      style={{ color: 'rgba(255,255,255,0.88)', animation: 'none' }}
    >
      {repeated.map((item, i) => (
        <span key={i} className="tamil-heading flex items-center gap-2 flex-shrink-0 text-sm">
          <span style={{ color: 'var(--gold)', fontSize: '10px' }}>◆</span>
          {item.title}
        </span>
      ))}
    </div>
  )
}
