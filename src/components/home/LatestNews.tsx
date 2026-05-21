'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getNews } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  'Local News':  { bg: '#fbeaf0', text: '#72243e' },
  'World News':  { bg: '#faeeda', text: '#633806' },
  'News':        { bg: '#e6f1fb', text: '#0c447c' },
  'History':     { bg: '#eaf3de', text: '#27500a' },
}

const BG_FALLBACKS = [
  'linear-gradient(135deg,#1a3d1a,#2d6130)',
  'linear-gradient(135deg,#0a0a20,#1a1a3d)',
  'linear-gradient(135deg,#200a0a,#3d1a1a)',
  'linear-gradient(135deg,#0d2e1b,#1a5535)',
  'linear-gradient(135deg,#1a2d3d,#2a4060)',
]

export default function LatestNews() {
  const [items, setItems]     = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNews().then((all) => { setItems(all.slice(0, 5)); setLoading(false) })
  }, [])

  const cat = (name: string) => CAT_COLORS[name] ?? { bg: '#f1f5f9', text: '#475569' }

  return (
    <div>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '4px', height: '18px', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-dark)' }}>Latest News</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <Link href="/news" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)' }}>All →</Link>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', minHeight: '54px', borderBottom: '1px solid var(--border)', gap: 0 }}>
                <div className="animate-shimmer-light" style={{ width: '60px', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div className="animate-shimmer-light" style={{ height: '10px', width: '40%', borderRadius: '2px' }} />
                  <div className="animate-shimmer-light" style={{ height: '10px', width: '90%', borderRadius: '2px' }} />
                </div>
              </div>
            ))
          : items.map((item, i) => {
            const c = cat(item.category)
            const isLast = i === items.length - 1
            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                style={{
                  display: 'flex', alignItems: 'stretch',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  minHeight: '54px', textDecoration: 'none',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-pale)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Thumbnail — same height as text via alignSelf:stretch */}
                <div style={{ width: '60px', flexShrink: 0, alignSelf: 'stretch', position: 'relative', background: 'var(--green-light)' }}>
                  {item.featured_image ? (
                    <Image src={item.featured_image} alt={item.title} fill sizes="60px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: BG_FALLBACKS[i % BG_FALLBACKS.length] }} />
                  )}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0, padding: '5px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: 900, letterSpacing: '.09em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '2px', background: c.bg, color: c.text }}>
                    {item.category}
                  </span>
                  <p style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '11px', fontWeight: 700, color: 'var(--dark)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </p>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
                    {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            )
          })
        }
      </div>
    </div>
  )
}
