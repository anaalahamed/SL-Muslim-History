'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getNews } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'

export default function SpecialNews() {
  const [items, setItems]     = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNews().then((all) => { setItems(all.slice(0, 6)); setLoading(false) })
  }, [])

  return (
    <div>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ background: 'var(--green-dark)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '5px 11px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Today Update
        </div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginLeft: '8px' }} />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#1c1c1c', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '7px 10px', fontFamily: "'Noto Sans Tamil','Lato',sans-serif", borderBottom: '2px solid var(--gold)' }}>
          சிறப்புச் செய்திகள்
        </div>

        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', minHeight: '60px', borderBottom: '1px solid var(--border)', padding: '8px 10px', gap: '8px' }}>
                <div className="animate-shimmer-light" style={{ flex: 1, borderRadius: '2px' }} />
                <div className="animate-shimmer-light" style={{ width: '76px', borderRadius: '2px' }} />
              </div>
            ))
          : items.map((item, i) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              style={{
                display: 'flex', alignItems: 'stretch',
                borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                minHeight: '64px', textDecoration: 'none',
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-pale)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {/* Text left */}
              <div style={{ flex: 1, minWidth: 0, padding: '7px 9px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                <p style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '11px', fontWeight: 700, color: 'var(--red, #c0392b)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.title}
                </p>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
                  {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Image right — same height as text via align-self:stretch */}
              <div style={{ width: '80px', flexShrink: 0, alignSelf: 'stretch', position: 'relative', background: 'var(--green-light)' }}>
                {item.featured_image ? (
                  <Image
                    src={item.featured_image}
                    alt={item.title}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a3d1a,#2d6130)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🗞️</div>
                )}
              </div>
            </Link>
          ))
        }

        <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border)' }}>
          <Link href="/news" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)' }}>
            View all special news →
          </Link>
        </div>
      </div>
    </div>
  )
}
