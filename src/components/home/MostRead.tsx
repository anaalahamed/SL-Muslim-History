'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getArticles } from '@/lib/db/articles'
import { Article } from '@/lib/types'

const RANK_COLORS = [
  { bg: 'var(--gold)', text: '#fff' },
  { bg: '#94a3b8',    text: '#fff' },
  { bg: '#cd7c2f',    text: '#fff' },
  { bg: 'var(--green-light)', text: 'var(--green-dark)' },
  { bg: 'var(--green-light)', text: 'var(--green-dark)' },
]
const BG_FALLBACKS = [
  'linear-gradient(135deg,#1a3d1a,#2d6130)',
  'linear-gradient(135deg,#0a0a20,#1a1a3d)',
  'linear-gradient(135deg,#200a0a,#3d1a1a)',
  'linear-gradient(135deg,#0d2e1b,#1a5535)',
  'linear-gradient(135deg,#1a2d3d,#2a4060)',
]

export default function MostRead() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getArticles().then((all) => {
      const top = [...all].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5)
      setArticles(top)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '4px', height: '18px', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-dark)' }}>Most Read</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', minHeight: '54px', borderBottom: '1px solid var(--border)', gap: 0 }}>
                <div className="animate-shimmer-light" style={{ width: '22px', flexShrink: 0 }} />
                <div className="animate-shimmer-light" style={{ width: '52px', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div className="animate-shimmer-light" style={{ height: '10px', width: '90%', borderRadius: '2px' }} />
                  <div className="animate-shimmer-light" style={{ height: '9px', width: '30%', borderRadius: '2px' }} />
                </div>
              </div>
            ))
          : articles.map((article, i) => {
            const rank = RANK_COLORS[i] ?? RANK_COLORS[4]
            const isLast = i === articles.length - 1
            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                style={{
                  display: 'flex', alignItems: 'stretch',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  minHeight: '54px', textDecoration: 'none',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-pale)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Rank number */}
                <div style={{ width: '22px', flexShrink: 0, alignSelf: 'stretch', background: rank.bg, color: rank.text, fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i + 1}
                </div>

                {/* Thumbnail */}
                <div style={{ width: '52px', flexShrink: 0, alignSelf: 'stretch', position: 'relative', background: 'var(--green-light)' }}>
                  {article.featured_image ? (
                    <Image src={article.featured_image} alt={article.title} fill sizes="52px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: BG_FALLBACKS[i % BG_FALLBACKS.length] }} />
                  )}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0, padding: '5px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }}>
                  <p style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '11px', fontWeight: 700, color: 'var(--dark)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.title}
                  </p>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>👁 {article.views} views</span>
                </div>
              </Link>
            )
          })
        }
      </div>
    </div>
  )
}
