'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getArticles } from '@/lib/db/articles'
import { getCategories } from '@/lib/db/categories'
import { Article, Category } from '@/lib/types'
import { formatViews, readingTime } from '@/lib/utils'
import AnimateIn from '@/components/ui/AnimateIn'
import PageHero from '@/components/ui/PageHero'
import { ArticleListSkeleton } from '@/components/ui/Skeleton'
import AdBanner from '@/components/ui/AdBanner'

const categoryColors: Record<string, string> = {
  'Early History':        '#dbeafe',
  'Mosques & Places':     '#dcfce7',
  'Culture & Traditions': '#fef9c3',
  'Notable Figures':      '#f3e8ff',
  'Literature & Arts':    '#ffedd5',
  'Community & Society':  '#e0f2fe',
}
const categoryText: Record<string, string> = {
  'Early History':        '#1d4ed8',
  'Mosques & Places':     '#15803d',
  'Culture & Traditions': '#a16207',
  'Notable Figures':      '#7c3aed',
  'Literature & Arts':    '#c2410c',
  'Community & Society':  '#0369a1',
}

function buildPreview(excerpt: string, content: string): string {
  const parts: string[] = []
  if (excerpt?.trim()) parts.push(excerpt.trim())
  if (content?.trim()) {
    const paras = content.split('\n\n').map(p => p.trim()).filter(Boolean)
    for (const para of paras) {
      if (para !== excerpt?.trim()) {
        parts.push(para)
        break
      }
    }
  }
  return parts.join(' — ')
}

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'popular',  label: 'Most Popular' },
]

const PER_PAGE = 12

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getArticles(), getCategories()]).then(([a, c]) => {
      setArticles(a)
      setCategories(c)
      setLoading(false)
    })
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [activeCategory, sortBy, searchQuery])

  const filtered = articles
    .filter((a) => activeCategory === 'all' || a.category_slug === activeCategory)
    .filter((a) =>
      searchQuery.trim() === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.views - a.views
      if (sortBy === 'oldest')  return new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <PageHero
        badge="Articles"
        title="Explore Sri Lanka Muslim History"
        subtitle="In-depth research articles on the rich history, culture, and heritage of Sri Lanka's Muslim community."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <AdBanner position="banner" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Filter bar */}
        <AnimateIn direction="up" className="mb-8">
          <div
            className="p-4 rounded-2xl flex flex-col gap-4"
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--muted)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--green)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveCategory('all')}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: activeCategory === 'all' ? 'var(--green)' : 'var(--bg)',
                  color:      activeCategory === 'all' ? 'white'        : 'var(--muted)',
                  border: `1px solid ${activeCategory === 'all' ? 'var(--green)' : 'var(--border)'}`,
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: activeCategory === cat.slug ? 'var(--green)' : 'var(--bg)',
                    color:      activeCategory === cat.slug ? 'white'        : 'var(--muted)',
                    border: `1px solid ${activeCategory === cat.slug ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >
                  {cat.icon} {cat.name_en}
                </button>
              ))}
            </div>

            {/* Sort + count */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                Showing <strong style={{ color: 'var(--dark)' }}>{filtered.length}</strong> article{filtered.length !== 1 ? 's' : ''}
                {totalPages > 1 && <> — page <strong style={{ color: 'var(--dark)' }}>{page}</strong> of {totalPages}</>}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--dark)',
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </AnimateIn>

        {/* Articles — editorial magazine style */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ArticleListSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <AnimateIn direction="up" className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-bold" style={{ color: 'var(--dark)' }}>No articles found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Try a different category or search term.</p>
          </AnimateIn>
        ) : (
          <div className="flex flex-col gap-4">
            {paginated.map((article, i) => (
              <AnimateIn key={article.id} direction="up" delay={i * 60}>
                <Link
                  href={article.slug ? `/articles/${article.slug}` : '/articles'}
                  className="group relative block rounded-2xl overflow-hidden"
                  style={{
                    background: categoryColors[article.category] ?? '#f8fafc',
                    border: `1px solid ${categoryText[article.category] ? categoryText[article.category] + '22' : 'var(--border)'}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.12)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex gap-4 p-5 md:p-6">

                    {/* Article number */}
                    <div
                      className="hidden sm:flex items-start pt-1 flex-shrink-0 select-none"
                      style={{ width: '48px' }}
                    >
                      <span
                        className="font-black text-3xl leading-none"
                        style={{ color: categoryText[article.category] ? categoryText[article.category] + '33' : 'rgba(0,0,0,0.08)' }}
                      >
                        {String((page - 1) * PER_PAGE + i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      {/* Category + date + featured badge */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        {article.is_featured && (
                          <span
                            className="text-xs font-black px-2.5 py-0.5 rounded-full"
                            style={{ background: 'var(--gold)', color: '#5a3a00' }}
                          >
                            ✦ Featured
                          </span>
                        )}
                        <span
                          className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                          style={{
                            background: categoryText[article.category] ?? '#475569',
                            color: 'white',
                          }}
                        >
                          {article.category}
                        </span>
                        <span className="text-xs" style={{ color: categoryText[article.category] ?? 'var(--muted)', opacity: 0.75 }}>
                          {new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className="tamil-heading font-extrabold text-lg md:text-xl mb-2 group-hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--dark)', lineHeight: '1.45' }}
                      >
                        {article.title}
                      </h2>

                      {/* Preview text */}
                      <p
                        className="tamil-text text-sm mb-3"
                        style={{
                          color: 'var(--text)',
                          lineHeight: '1.85',
                          fontSize: '0.875rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          opacity: 0.8,
                        }}
                      >
                        {buildPreview(article.excerpt ?? '', article.content)}
                      </p>

                      {/* Footer row */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 text-xs" style={{ color: categoryText[article.category] ?? 'var(--muted)', opacity: 0.8 }}>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                              style={{ background: categoryText[article.category] ?? 'var(--green)' }}
                            >
                              {article.author.charAt(0)}
                            </div>
                            <span className="font-semibold">{article.author}</span>
                          </div>
                          <span>·</span>
                          <span>👁 {formatViews(article.views)}</span>
                          {article.content && <><span>·</span><span>⏱ {readingTime(article.content)}</span></>}
                        </div>
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ background: categoryText[article.category] ?? 'var(--green)', color: 'white' }}
                        >
                          Read article →
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail — fixed 16:9 */}
                    <div
                      className="relative hidden md:block flex-shrink-0 rounded-xl overflow-hidden"
                      style={{
                        width: '224px',
                        aspectRatio: '16/9',
                        background: '#e2e8f0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      }}
                    >
                      {article.featured_image ? (
                        <Image
                          src={article.featured_image}
                          alt={article.title}
                          fill
                          sizes="224px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">🕌</div>
                      )}
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
