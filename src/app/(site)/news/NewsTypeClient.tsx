'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getAllNewsByType } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import AnimateIn from '@/components/ui/AnimateIn'
import PageHero from '@/components/ui/PageHero'
import { NewsListSkeleton } from '@/components/ui/Skeleton'
import AdBanner from '@/components/ui/AdBanner'

const PER_PAGE = 12

interface Props {
  newsType: 'special' | 'janaza'
  badge: string
  title: string
  subtitle: string
}

export default function NewsTypeClient({ newsType, badge, title, subtitle }: Props) {
  const [news, setNews]       = useState<NewsPost[]>([])
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllNewsByType(newsType).then((d) => { setNews(d); setLoading(false) })
  }, [newsType])

  // Only show a featured story when the admin explicitly marks one (is_featured === true).
  // Strict === true guards against null/undefined returned by Supabase when the column is new.
  // Items are ordered by published_at desc so find() returns the newest featured item.
  const featured = news.find((n) => n.is_featured === true) ?? null
  const list     = featured ? news.filter((n) => n.id !== featured.id) : news

  const totalPages = Math.ceil(list.length / PER_PAGE)
  const paginated  = list.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const accentColor = newsType === 'janaza' ? '#0369a1' : 'var(--green)'
  const badgeBg     = newsType === 'janaza' ? '#f0f9ff'  : '#f0fdf4'
  const badgeColor  = newsType === 'janaza' ? '#0369a1'  : '#166534'
  const typeLabel   = newsType === 'janaza' ? 'Janaza News' : 'சிறப்புச் செய்திகள்'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <PageHero badge={badge} title={title} subtitle={subtitle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <AdBanner position="banner" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Top featured item */}
        {!loading && featured && (
          <AnimateIn direction="up" className="mb-8">
            <Link
              href={`/news/${featured.slug}`}
              className="group flex flex-col md:flex-row rounded-2xl overflow-hidden"
              style={{
                border: '1px solid var(--border)',
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = newsType === 'janaza'
                  ? '0 12px 36px rgba(3,105,161,0.15)'
                  : '0 12px 36px rgba(74,158,31,0.15)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div className="relative md:w-72 h-52 md:h-auto flex-shrink-0 overflow-hidden" style={{ minHeight: '200px' }}>
                {featured.featured_image ? (
                  <Image
                    src={featured.featured_image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 288px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-6xl"
                    style={{ background: 'var(--green-light)' }}
                  >
                    📰
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: badgeBg, color: badgeColor }}
                  >
                    {typeLabel}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {formatDate(featured.published_at)}
                  </span>
                </div>
                <h2
                  className="tamil-heading font-extrabold text-xl mb-3"
                  style={{ color: 'var(--dark)', lineHeight: '1.5' }}
                >
                  {featured.title}
                </h2>
                <p
                  className="tamil-text text-sm line-clamp-3"
                  style={{ color: 'var(--muted)', lineHeight: '1.8' }}
                >
                  {featured.content?.split('\n\n')[0] ?? ''}
                </p>
                <span
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold"
                  style={{ color: accentColor }}
                >
                  Read more →
                </span>
              </div>
            </Link>
          </AnimateIn>
        )}

        {/* Count bar */}
        {!loading && (
          <AnimateIn direction="up" className="mb-6">
            <div
              className="px-4 py-3 rounded-2xl flex items-center justify-between"
              style={{ background: 'white', border: '1px solid var(--border)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--dark)' }}>
                {typeLabel}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--dark)' }}>{news.length}</strong> stories
                {featured && <span style={{ color: 'var(--muted)' }}> (1 featured)</span>}
                {totalPages > 1 && <> — page <strong style={{ color: 'var(--dark)' }}>{page}</strong> of {totalPages}</>}
              </span>
            </div>
          </AnimateIn>
        )}

        {/* News feed */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => <NewsListSkeleton key={i} />)}
          </div>
        ) : news.length === 0 ? (
          <AnimateIn direction="up" className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-bold" style={{ color: 'var(--dark)' }}>No stories found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Check back soon.</p>
          </AnimateIn>
        ) : (
          <div className="flex flex-col gap-4">
            {paginated.map((item, i) => (
              <AnimateIn key={item.id} direction="up" delay={i * 60}>
                <Link
                  href={`/news/${item.slug}`}
                  className="group block rounded-2xl overflow-hidden"
                  style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex gap-0">
                    <div
                      className="w-1 flex-shrink-0 self-stretch"
                      style={{ background: accentColor }}
                    />
                    <div className="flex flex-col sm:flex-row flex-1 gap-4 p-4 md:p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded"
                            style={{ background: badgeBg, color: badgeColor }}
                          >
                            {newsType === 'janaza' ? 'Janaza' : 'சிறப்பு'}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                            {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>

                        <h2
                          className="tamil-heading font-extrabold text-base md:text-lg mb-2 transition-colors"
                          style={{ color: 'var(--dark)', lineHeight: '1.5' }}
                        >
                          {item.title}
                        </h2>

                        <p
                          className="tamil-text text-sm"
                          style={{
                            color: 'var(--muted)',
                            lineHeight: '1.85',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.content?.split('\n\n')[0] ?? ''}
                        </p>

                        <span
                          className="inline-block mt-3 text-xs font-bold"
                          style={{ color: accentColor }}
                        >
                          Read full story →
                        </span>
                      </div>

                      {/* Thumbnail */}
                      <div
                        className="relative w-full sm:w-44 md:w-52 flex-shrink-0 rounded-xl overflow-hidden"
                        style={{ aspectRatio: '4/3' }}
                      >
                        {item.featured_image ? (
                          <Image
                            src={item.featured_image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 176px, 208px"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center text-4xl"
                            style={{ background: 'var(--green-light)' }}
                          >
                            📰
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: page === 1 ? 'var(--border)' : 'white',
                color:      page === 1 ? 'var(--muted)'  : 'var(--dark)',
                border:     '1px solid var(--border)',
                cursor:     page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isEllipsis = totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages
              if (isEllipsis && (p === page - 3 || p === page + 3)) {
                return <span key={p} style={{ color: 'var(--muted)' }}>…</span>
              }
              if (isEllipsis) return null
              return (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: p === page ? accentColor : 'white',
                    color:      p === page ? 'white'      : 'var(--dark)',
                    border:     `1px solid ${p === page ? accentColor : 'var(--border)'}`,
                  }}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: page === totalPages ? 'var(--border)' : 'white',
                color:      page === totalPages ? 'var(--muted)'  : 'var(--dark)',
                border:     '1px solid var(--border)',
                cursor:     page === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
