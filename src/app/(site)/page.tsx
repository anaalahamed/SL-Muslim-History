'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getNews } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import AnimateIn from '@/components/ui/AnimateIn'
import PageHero from '@/components/ui/PageHero'
import { NewsListSkeleton } from '@/components/ui/Skeleton'
import AdBanner from '@/components/ui/AdBanner'

const NEWS_CATEGORIES = ['All', 'Community', 'Heritage', 'Education', 'Literature']

const PER_PAGE = 12

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Community:  { bg: '#dcfce7', text: '#15803d' },
  Heritage:   { bg: '#fef9c3', text: '#a16207' },
  Education:  { bg: '#dbeafe', text: '#1d4ed8' },
  Literature: { bg: '#f3e8ff', text: '#7c3aed' },
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [showBreakingOnly, setShowBreakingOnly] = useState(false)
  const [allNews, setAllNews] = useState<NewsPost[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => { getNews().then((d) => { setAllNews(d); setLoading(false) }) }, [])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [activeCategory, showBreakingOnly])

  const filtered = allNews
    .filter((n) => activeCategory === 'All' || n.category === activeCategory)
    .filter((n) => !showBreakingOnly || n.is_breaking)

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const breaking = allNews.filter((n) => n.is_breaking)
  const featured = allNews[0] ?? null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <PageHero
        badge="Latest News"
        title="News & Updates"
        subtitle="Stay informed with the latest news about Sri Lanka's Muslim heritage, community events, and historical discoveries."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <AdBanner position="banner" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Breaking news banner */}
        {breaking.length > 0 && (
          <AnimateIn direction="up" className="mb-8">
            <div
              className="rounded-2xl p-5"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse"
                  style={{ background: '#dc2626', color: 'white' }}
                >
                  🔴 Breaking
                </span>
                <span className="text-sm font-semibold" style={{ color: '#991b1b' }}>
                  {breaking.length} breaking {breaking.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {breaking.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="flex items-start gap-3 p-3 rounded-xl transition-all"
                    style={{ background: 'white', border: '1px solid #fecaca' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#dc2626' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#fecaca' }}
                  >
                    <span className="text-red-600 mt-0.5 flex-shrink-0">→</span>
                    <p
                      className="tamil-heading text-sm font-semibold line-clamp-2"
                      style={{ color: '#991b1b', lineHeight: '1.6' }}
                    >
                      {item.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </AnimateIn>
        )}

        {/* Top featured news */}
        {featured && <AnimateIn direction="up" className="mb-8">
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
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(74,158,31,0.15)'
              e.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Featured story image */}
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
            {/* Content */}
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                {featured.is_breaking && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: '#fee2e2', color: '#b91c1c' }}
                  >
                    Breaking
                  </span>
                )}
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: categoryStyle[featured.category]?.bg ?? '#f1f5f9',
                    color:      categoryStyle[featured.category]?.text ?? '#475569',
                  }}
                >
                  {featured.category}
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
                {featured.excerpt}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold"
                style={{ color: 'var(--green)' }}
              >
                Read more →
              </span>
            </div>
          </Link>
        </AnimateIn>}

        {/* Filter bar */}
        <AnimateIn direction="up" className="mb-8">
          <div
            className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {NEWS_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: activeCategory === cat ? 'var(--green)' : 'var(--bg)',
                    color:      activeCategory === cat ? 'white'        : 'var(--muted)',
                    border: `1px solid ${activeCategory === cat ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Breaking toggle + count */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBreakingOnly(!showBreakingOnly)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: showBreakingOnly ? '#dc2626' : 'var(--bg)',
                  color:      showBreakingOnly ? 'white'    : 'var(--muted)',
                  border: `1px solid ${showBreakingOnly ? '#dc2626' : 'var(--border)'}`,
                }}
              >
                🔴 Breaking only
              </button>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--dark)' }}>{filtered.length}</strong> stories
                {totalPages > 1 && <> — page <strong style={{ color: 'var(--dark)' }}>{page}</strong> of {totalPages}</>}
              </span>
            </div>
          </div>
        </AnimateIn>

        {/* News feed */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => <NewsListSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <AnimateIn direction="up" className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-bold" style={{ color: 'var(--dark)' }}>No stories found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Try a different category or filter.</p>
          </AnimateIn>
        ) : (
          <div className="flex flex-col gap-4">
            {paginated.map((news, i) => (
              <AnimateIn key={news.id} direction="up" delay={i * 60}>
                <Link
                  href={`/news/${news.slug}`}
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
                  {/* Breaking banner */}
                  {news.is_breaking && (
                    <div
                      className="flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest"
                      style={{ background: '#dc2626', color: 'white' }}
                    >
                      <span className="animate-pulse">●</span> Breaking News
                    </div>
                  )}

                  <div className="flex gap-0">
                    {/* Colored left accent bar */}
                    <div
                      className="w-1 flex-shrink-0 self-stretch"
                      style={{ background: categoryStyle[news.category]?.text ?? 'var(--green)' }}
                    />

                    {/* Main content */}
                    <div className="flex flex-col sm:flex-row flex-1 gap-4 p-4 md:p-5">

                      {/* Text — left side */}
                      <div className="flex-1 min-w-0">
                        {/* Dateline */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded"
                            style={{
                              background: categoryStyle[news.category]?.bg ?? '#f1f5f9',
                              color:      categoryStyle[news.category]?.text ?? '#475569',
                            }}
                          >
                            {news.category}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                            {new Date(news.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Headline */}
                        <h2
                          className="tamil-heading font-extrabold text-base md:text-lg mb-2 group-hover:text-green-800 transition-colors"
                          style={{ color: 'var(--dark)', lineHeight: '1.5' }}
                        >
                          {news.title}
                        </h2>

                        {/* Body preview */}
                        <p
                          className="tamil-text text-sm"
                          style={{
                            color: 'var(--muted)',
                            lineHeight: '1.85',
                            fontSize: '0.875rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {news.excerpt}
                          {news.content?.trim() && news.content.trim() !== news.excerpt?.trim()
                            ? ' — ' + news.content.split('\n\n').find(p => p.trim() && p.trim() !== news.excerpt?.trim())
                            : ''}
                        </p>

                        {/* Read more */}
                        <span
                          className="inline-block mt-3 text-xs font-bold"
                          style={{ color: 'var(--green)' }}
                        >
                          Read full story →
                        </span>
                      </div>

                      {/* Thumbnail — fixed 4:3 */}
                      <div
                        className="relative w-full sm:w-44 md:w-52 flex-shrink-0 rounded-xl overflow-hidden"
                        style={{ aspectRatio: '4/3' }}
                      >
                        {news.featured_image ? (
                          <Image
                            src={news.featured_image}
                            alt={news.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 176px, 208px"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center text-4xl"
                            style={{ background: categoryStyle[news.category]?.bg ?? 'var(--green-light)' }}
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
                    background: p === page ? 'var(--green)' : 'white',
                    color:      p === page ? 'white'        : 'var(--dark)',
                    border:     `1px solid ${p === page ? 'var(--green)' : 'var(--border)'}`,
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
