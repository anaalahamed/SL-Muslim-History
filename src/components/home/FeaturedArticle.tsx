'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getFeaturedArticles } from '@/lib/db/articles'
import { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  'Early History':        { bg: '#eaf3de', text: '#27500a' },
  'Mosques & Places':     { bg: '#e6f1fb', text: '#0c447c' },
  'Culture & Traditions': { bg: '#faeeda', text: '#633806' },
  'Notable Figures':      { bg: '#fbeaf0', text: '#72243e' },
  'Literature & Arts':    { bg: '#f3e8ff', text: '#5b21b6' },
  'Community & Society':  { bg: '#e0f2fe', text: '#0c4a6e' },
  'World News':           { bg: '#faeeda', text: '#633806' },
  'Local News':           { bg: '#fbeaf0', text: '#72243e' },
}

const BG_FALLBACKS = [
  'linear-gradient(140deg,#0a200a,#1a3d1a)',
  'linear-gradient(140deg,#0a0a20,#1a1a3d)',
  'linear-gradient(140deg,#200a0a,#3d1a1a)',
  'linear-gradient(140deg,#0d2e1b,#1a5535)',
  'linear-gradient(140deg,#1a2d3d,#2a4060)',
]

export default function FeaturedArticle() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getFeaturedArticles().then((data) => { setArticles(data); setLoading(false) })
  }, [])

  const cat = (name: string) => CAT_COLORS[name] ?? { bg: '#f1f5f9', text: '#475569' }

  if (!loading && articles.length === 0) return null

  return (
    <div>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '4px', height: '18px', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-dark)' }}>
          Featured Articles
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '9px', color: 'var(--gold)', background: 'rgba(184,137,42,.1)', border: '1px solid rgba(184,137,42,.25)', padding: '2px 7px', borderRadius: '2px', fontWeight: 700 }}>
          ⭐ Admin Selected
        </span>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', minHeight: '72px', borderBottom: i === 0 ? '1px solid var(--border)' : 'none', gap: 0 }}>
                <div className="animate-shimmer-light" style={{ width: '90px', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="animate-shimmer-light" style={{ height: '12px', width: '55%', borderRadius: '2px' }} />
                  <div className="animate-shimmer-light" style={{ height: '10px', width: '90%', borderRadius: '2px' }} />
                </div>
              </div>
            ))
          : articles.map((article, i) => {
            const c = cat(article.category)
            const isLast = i === articles.length - 1
            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                style={{
                  display: 'flex', alignItems: 'stretch',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  minHeight: '72px', textDecoration: 'none',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--green-pale)'
                  const t = e.currentTarget.querySelector('.feat-title') as HTMLElement
                  if (t) t.style.color = 'var(--green-dark)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  const t = e.currentTarget.querySelector('.feat-title') as HTMLElement
                  if (t) t.style.color = 'var(--dark)'
                }}
              >
                {/* Thumbnail */}
                <div style={{ width: '90px', flexShrink: 0, alignSelf: 'stretch', position: 'relative', background: 'var(--green-light)' }}>
                  {article.featured_image ? (
                    <Image src={article.featured_image} alt={article.title} fill sizes="90px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: BG_FALLBACKS[i % BG_FALLBACKS.length] }} />
                  )}
                  {/* Pinned badge on first item */}
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--gold)', color: '#0f2a0f', fontSize: '8px', fontWeight: 900, padding: '2px 5px', borderRadius: '2px' }}>
                      ✦ Featured
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0, padding: '7px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ display: 'inline-block', marginBottom: '3px', fontSize: '9px', fontWeight: 900, letterSpacing: '.09em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '2px', background: c.bg, color: c.text }}>
                      {article.category}
                    </span>
                  </div>
                  <p className="feat-title" style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '11px', fontWeight: 700, lineHeight: 1.5, color: 'var(--dark)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.title}
                  </p>
                  <p style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '10px', color: 'var(--muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '2px' }}>
                    {article.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '9px', color: 'var(--muted)' }}>
                    <span>👁 {article.views}</span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span>{article.author}</span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                </div>
              </Link>
            )
          })
        }
      </div>
    </div>
  )
}
