'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getAds } from '@/lib/db/ads'
import { Advertisement } from '@/lib/types'

interface Props {
  position: 'sidebar' | 'banner'
  className?: string
}

export default function AdBanner({ position, className = '' }: Props) {
  const [ads, setAds] = useState<Advertisement[]>([])

  useEffect(() => {
    getAds(position).then(setAds)
  }, [position])

  if (ads.length === 0) return null

  /* ── Full-width leaderboard banner ── */
  if (position === 'banner') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#b0b8c1', letterSpacing: '0.12em' }}>
            Advertisement
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>
        <div className="space-y-3">
          {ads.map((ad) => (
            <a
              key={ad.id}
              href={ad.link_url || '#'}
              target={ad.link_url ? '_blank' : undefined}
              rel="noopener noreferrer sponsored"
              className="block w-full overflow-hidden rounded-xl transition-all"
              style={{ border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div className="relative w-full" style={{ aspectRatio: '728/90', minHeight: '60px' }}>
                <Image
                  src={ad.image_url}
                  alt={ad.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 728px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  /* ── Sidebar box ad ── */
  return (
    <div className={`${className}`}>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'white' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border)', background: '#fafafa' }}
        >
          <span className="text-xs font-extrabold tracking-widest uppercase" style={{ color: '#94a3b8', letterSpacing: '0.1em' }}>
            Advertisement
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: '#f1f5f9', color: '#94a3b8' }}>AD</span>
        </div>

        {/* Ad image(s) */}
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {ads.map((ad) => (
            <a
              key={ad.id}
              href={ad.link_url || '#'}
              target={ad.link_url ? '_blank' : undefined}
              rel="noopener noreferrer sponsored"
              className="block relative overflow-hidden transition-all"
              style={{ aspectRatio: '300/250' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                sizes="300px"
                style={{ objectFit: 'cover' }}
              />
            </a>
          ))}
        </div>

        {/* Footer label */}
        <div className="px-4 py-2 text-center" style={{ background: '#fafafa', borderTop: '1px solid var(--border)' }}>
          <span className="text-xs" style={{ color: '#b0b8c1' }}>Sponsored content</span>
        </div>
      </div>
    </div>
  )
}
