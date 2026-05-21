'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getArticles } from '@/lib/db/articles'
import { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  'Early History':        { bg: '#eaf3de', text: '#27500a' },
  'Mosques & Places':     { bg: '#e6f1fb', text: '#0c447c' },
  'Culture & Traditions': { bg: '#faeeda', text: '#633806' },
  'Notable Figures':      { bg: '#fbeaf0', text: '#72243e' },
  'Literature & Arts':    { bg: '#f3e8ff', text: '#5b21b6' },
  'Community & Society':  { bg: '#e0f2fe', text: '#0c4a6e' },
  'World News':           { bg: '#faeeda', text: '#633806' },
  'Local News':           { bg: '#fbeaf0', text: '#72243e' },
  'News':                 { bg: '#e6f1fb', text: '#0c447c' },
}

const BG_FALLBACKS = [
  'linear-gradient(135deg,#0a0a20,#1a1a3d)',
  'linear-gradient(135deg,#200a0a,#3d1a1a)',
  'linear-gradient(135deg,#1a3d1a,#2d6130)',
  'linear-gradient(135deg,#0d2e1b,#1a5535)',
  'linear-gradient(135deg,#1a2d3d,#2a4060)',
  'linear-gradient(135deg,#200a20,#3d1a3d)',
  'linear-gradient(135deg,#1a1500,#3d3000)',
  'linear-gradient(135deg,#0a1a0a,#1a3d20)',
  'linear-gradient(135deg,#200f0a,#3d2010)',
  'linear-gradient(135deg,#0a1020,#1a2040)',
]

export default function AllArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getArticles().then((all) => {
      // exclude featured (pinned) articles from this list
      const rest = all.filter((a) => !a.is_featured)
      setArticles(rest)
      setLoading(false)
    })
  }, [])

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE)
  const visible    = articles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const cat        = (name: string) => CAT_COLORS[name] ?? { bg: '#f1f5f9', text: '#475569' }

  const goPage = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '4px', height: '18px', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-dark)' }}>
          All Articles
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <Link href="/articles" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)' }}>
          View all →
        </Link>
      </div>

      {/* Article list */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', minHeight: '72px', borderBottom: '1px solid var(--border)', gap: 0 }}>
                <div className="animate-shimmer-light" style={{ width: '90px', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="animate-shimmer-light" style={{ height: '12px', width: '55%', borderRadius: '2px' }} />
                  <div className="animate-shimmer-light" style={{ height: '10px', width: '90%', borderRadius: '2px' }} />
                  <div className="animate-shimmer-light" style={{ height: '9px', width: '40%', borderRadius: '2px', marginTop: 'auto' }} />
                </div>
              </div>
            ))
          : visible.map((article, i) => {
            const c = cat(article.category)
            const isLast = i === visible.length - 1
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
                  const t = e.currentTarget.querySelector('.art-title') as HTMLElement
                  if (t) t.style.color = 'var(--green-dark)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  const t = e.currentTarget.querySelector('.art-title') as HTMLElement
                  if (t) t.style.color = 'var(--dark)'
                }}
              >
                {/* Thumbnail — stretches to full row height */}
                <div style={{ width: '90px', flexShrink: 0, alignSelf: 'stretch', position: 'relative', background: 'var(--green-light)' }}>
                  {article.featured_image ? (
                    <Image src={article.featured_image} alt={article.title} fill sizes="90px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: BG_FALLBACKS[i % BG_FALLBACKS.length] }} />
                  )}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0, padding: '7px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Category badge */}
                  <div>
                    <span style={{ display: 'inline-block', marginBottom: '3px', fontSize: '9px', fontWeight: 900, letterSpacing: '.09em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '2px', background: c.bg, color: c.text }}>
                      {article.category}
                    </span>
                  </div>
                  {/* Title — 2 line clamp */}
                  <p
                    className="art-title"
                    style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '11px', fontWeight: 700, lineHeight: 1.5, color: 'var(--dark)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {article.title}
                  </p>
                  {/* Excerpt — 1 line */}
                  <p style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '10px', color: 'var(--muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '2px' }}>
                    {article.excerpt}
                  </p>
                  {/* Meta */}
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '10px 0' }}>
          {page > 1 && (
            <button onClick={() => goPage(page - 1)} style={pgBtn(false)}>« Prev</button>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => goPage(p)} style={pgBtn(p === page)}>
                {p}
              </button>
            )
          })}
          {totalPages > 7 && (
            <>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>...</span>
              <button onClick={() => goPage(totalPages)} style={pgBtn(page === totalPages)}>{totalPages}</button>
            </>
          )}
          {page < totalPages && (
            <button onClick={() => goPage(page + 1)} style={pgBtn(false)}>Next »</button>
          )}
        </div>
      )}
    </div>
  )
}

function pgBtn(active: boolean): React.CSSProperties {
  return {
    minWidth: '26px', height: '26px', padding: '0 8px',
    borderRadius: '3px',
    border: `1px solid ${active ? 'var(--green-dark)' : 'var(--border)'}`,
    background: active ? 'var(--green-dark)' : 'var(--white)',
    color: active ? '#fff' : 'var(--dark)',
    fontSize: '11px', fontWeight: 700,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s',
  }
}
