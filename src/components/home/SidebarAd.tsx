'use client'

import { useState, useEffect } from 'react'
import { getSidebarAd } from '@/lib/db/ads'
import { Advertisement } from '@/lib/types'

export default function SidebarAd() {
  const [ad, setAd] = useState<Advertisement | null>(null)

  useEffect(() => { getSidebarAd().then(setAd) }, [])

  if (!ad) return null

  const inner = (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: '3px',
      overflow: 'hidden',
      minHeight: '120px',
      maxHeight: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {ad.image_url ? (
        <img
          src={ad.image_url}
          alt={ad.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: '180px' }}
        />
      ) : (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dark)' }}>{ad.title}</p>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Advertisement</p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ marginBottom: '0' }}>
      <div style={{ fontSize: '9px', color: 'var(--muted)', textAlign: 'right', marginBottom: '3px', letterSpacing: '.05em', textTransform: 'uppercase' }}>
        Advertisement
      </div>
      {ad.link_url ? (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block' }}>
          {inner}
        </a>
      ) : inner}
    </div>
  )
}
