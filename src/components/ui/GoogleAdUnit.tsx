'use client'

import { useEffect, useRef } from 'react'

interface Props {
  slot: string
  style?: React.CSSProperties
  className?: string
}

// Renders one Google AdSense ad unit at a fixed, chosen spot on the page —
// deliberately NOT using AdSense's "Auto ads" (which scans the whole page
// and can insert ads anywhere Google picks). Each call is one specific,
// admin-chosen placement, same idea as the site's own manual ad slots.
export default function GoogleAdUnit({ slot, style, className }: Props) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] }
      ;(w.adsbygoogle = w.adsbygoogle || []).push({})
    } catch {
      // AdSense script not loaded yet, or blocked by an ad blocker -- fail silently
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className ?? ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-9374080740169651"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
