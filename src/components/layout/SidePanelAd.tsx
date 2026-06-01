'use client'

import { useState, useEffect } from 'react'
import { getAds } from '@/lib/db/ads'
import { Advertisement } from '@/lib/types'

interface Props {
  position: 'left-panel' | 'right-panel'
}

export default function SidePanelAd({ position }: Props) {
  const [ads, setAds] = useState<Advertisement[]>([])

  useEffect(() => { getAds(position).then(setAds) }, [position])

  if (ads.length === 0) return null

  return (
    <div style={{
      position: 'sticky',
      top: '110px', // clears sticky header (utility bar ~36px + masthead ~52px + nav ~36px)
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      width: '160px',
    }}>
      <span style={{
        fontSize: 9, fontWeight: 800, color: '#b0b8c1',
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        Advertisement
      </span>

      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.link_url || undefined}
          target={ad.link_url ? '_blank' : undefined}
          rel="noopener noreferrer sponsored"
          style={{ display: 'block', width: '100%', textDecoration: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image_url}
            alt={ad.title}
            style={{
              width: '160px',
              height: 'auto',
              display: 'block',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'translateY(0)' }}
          />
        </a>
      ))}
    </div>
  )
}
