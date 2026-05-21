'use client'

import { useState, useEffect } from 'react'
import { getAdminConfig } from '@/lib/adminConfig'

const colorMap = {
  green: { bg: '#4a9e1f', text: 'white',   hover: '#3a8010' },
  gold:  { bg: '#c9a84c', text: 'white',   hover: '#a8893a' },
  red:   { bg: '#dc2626', text: 'white',   hover: '#b91c1c' },
  blue:  { bg: '#1d4ed8', text: 'white',   hover: '#1e40af' },
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState({ enabled: false, text: '', link: '', color: 'green' as 'green' | 'gold' | 'red' | 'blue' })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const cfg = getAdminConfig()
    setAnnouncement(cfg.announcement)
    // Check if dismissed in this session
    const key = `slmh_announce_dismissed_${cfg.announcement.text}`
    if (sessionStorage.getItem(key)) setDismissed(true)
  }, [])

  function dismiss() {
    const key = `slmh_announce_dismissed_${announcement.text}`
    sessionStorage.setItem(key, '1')
    setDismissed(true)
  }

  if (!announcement.enabled || !announcement.text || dismissed) return null

  const colors = colorMap[announcement.color]

  const inner = (
    <div className="flex items-center justify-center gap-3 px-4 py-2.5 flex-wrap">
      <span className="text-sm font-semibold leading-snug text-center" style={{ color: colors.text }}>
        {announcement.text}
      </span>
      {announcement.link && (
        <span
          className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.25)', color: colors.text }}
        >
          Read more →
        </span>
      )}
    </div>
  )

  return (
    <div
      className="relative w-full"
      style={{ background: colors.bg }}
    >
      {announcement.link ? (
        <a
          href={announcement.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-all"
          style={{ background: colors.bg }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg }}
        >
          {inner}
        </a>
      ) : (
        <div>{inner}</div>
      )}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all"
        style={{ color: colors.text, background: 'rgba(255,255,255,0.15)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
      >
        ✕
      </button>
    </div>
  )
}
