'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getFeaturedArticles } from '@/lib/db/articles'
import { Article } from '@/lib/types'
import { formatDate, formatViews } from '@/lib/utils'
import AnimateIn from '@/components/ui/AnimateIn'
import { ArticleCardSkeleton } from '@/components/ui/Skeleton'

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Early History':        { bg: '#eaf3de', text: '#27500a' },
  'Mosques & Places':     { bg: '#e6f1fb', text: '#0c447c' },
  'Culture & Traditions': { bg: '#faeeda', text: '#633806' },
  'Notable Figures':      { bg: '#fbeaf0', text: '#72243e' },
  'Literature & Arts':    { bg: '#f3e8ff', text: '#5b21b6' },
  'Community & Society':  { bg: '#e0f2fe', text: '#0c4a6e' },
}

function buildPreview(excerpt: string, content: string): string {
  const parts: string[] = []
  if (excerpt?.trim()) parts.push(excerpt.trim())
  if (content?.trim()) {
    const paras = content.split('\n\n').map(p => p.trim()).filter(Boolean)
    for (const para of paras) {
      if (para !== excerpt?.trim()) { parts.push(para); break }
    }
  }
  return parts.join(' — ')
}

export default function FeaturedArticles() {
  const [featured, setFeatured] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getFeaturedArticles().then((data) => {
      setFeatured(data.slice(0, 5))
      setLoading(false)
    })
  }, [])

  const cat = (name: string) => categoryColors[name] ?? { bg: '#f1f5f9', text: '#475569' }

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Section header */}
      <AnimateIn direction="left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '4px', height: '22px', background: 'var(--gold)', flexShrink: 0 }} />
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: '13px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green-dark)' }}>
            Featured Articles
          </h2>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <Link
            href="/articles"
            style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--green-dark)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gold)' }}
          >
            View all →
          </Link>
        </div>
      </AnimateIn>

      {/* Article list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)
          : featured.map((article, i) => {
            const c = cat(article.category)
            return (
              <AnimateIn key={article.id} direction="up" delay={i * 80}>
                <Link
                  href={article.slug ? `/articles/${article.slug}` : '/articles'}
                  className="group"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(29,61,26,0.1)'
                    e.currentTarget.style.borderColor = 'var(--gold)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {/* Left gold accent bar */}
                  <div style={{ width: '3px', background: i === 0 ? 'var(--gold)' : 'var(--green-light)', flexShrink: 0 }} />

                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '200px',
                      flexShrink: 0,
                      position: 'relative',
                      background: 'var(--green-light)',
                      overflow: 'hidden',
                    }}
                  >
                    {article.featured_image ? (
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        sizes="200px"
                        style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        className="group-hover:scale-105"
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', background: 'var(--green-light)' }}>
                        🕌
                      </div>
                    )}
                    {article.is_featured && (
                      <span
                        style={{
                          position: 'absolute', top: '10px', left: '10px',
                          background: 'var(--gold)', color: '#0f2a0f',
                          fontSize: '9px', fontWeight: 900, padding: '3px 8px',
                          borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase',
                          zIndex: 1,
                        }}
                      >
                        ✦ Featured
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>

                    {/* Category + meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '10px', fontWeight: 700,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          padding: '3px 9px', borderRadius: '2px',
                          background: c.bg, color: c.text,
                        }}
                      >
                        {article.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}>
                        <span>{formatDate(article.published_at)}</span>
                        <span>👁 {formatViews(article.views)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="tamil-heading font-bold line-clamp-2"
                      style={{ fontSize: '16px', color: 'var(--dark)', marginBottom: '8px', lineHeight: '1.55', transition: 'color 0.2s' }}
                    >
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p
                      className="tamil-text line-clamp-2"
                      style={{ fontSize: '0.86rem', color: 'var(--muted)', lineHeight: '1.8', flex: 1, marginBottom: '14px' }}
                    >
                      {buildPreview(article.excerpt, article.content)}
                    </p>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--green-light)', color: 'var(--green-dark)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 900, flexShrink: 0,
                          }}
                        >
                          {article.author.charAt(0)}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark)' }}>{article.author}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '11px', fontWeight: 700,
                          padding: '5px 12px', borderRadius: '2px',
                          background: 'var(--green-pale)', color: 'var(--green-dark)',
                          border: '1px solid var(--green-light)',
                          transition: 'background 0.2s',
                        }}
                      >
                        Read more →
                      </span>
                    </div>

                  </div>
                </Link>
              </AnimateIn>
            )
          })}
      </div>
    </section>
  )
}
