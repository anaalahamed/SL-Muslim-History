'use client'

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import { getCategoryBySlug, getCategories } from '@/lib/db/categories'
import { getArticles } from '@/lib/db/articles'
import { Category, Article } from '@/lib/types'
import { formatDate, formatViews } from '@/lib/utils'
import AnimateIn from '@/components/ui/AnimateIn'
import { CategoryPageSkeleton } from '@/components/ui/Skeleton'
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
const categoryGradients: Record<string, string> = {
  'early-history':       'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
  'mosques-places':      'linear-gradient(135deg, #15803d 0%, #166534 100%)',
  'culture-traditions':  'linear-gradient(135deg, #a16207 0%, #92400e 100%)',
  'notable-figures':     'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  'literature-arts':     'linear-gradient(135deg, #c2410c 0%, #b45309 100%)',
  'community-society':   'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [category, setCategory] = useState<Category | null | undefined>(undefined)
  const [articles, setArticles] = useState<Article[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])

  useEffect(() => {
    getCategoryBySlug(slug).then((cat) => {
      setCategory(cat ?? null)
    })
    getArticles().then((all) => {
      setArticles(all.filter((a) => a.category_slug === slug))
    })
    getCategories().then(setAllCategories)
  }, [slug])

  if (category === undefined) return <CategoryPageSkeleton />
  if (!category) notFound()

  const [featured, ...rest] = articles

  const otherCategories = allCategories.filter((c) => c.slug !== slug)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Hero — unique gradient per category */}
      <div
        className="relative overflow-hidden py-14"
        style={{ background: categoryGradients[slug] ?? 'var(--green-dark)' }}
      >
        {/* Gold top border */}
        <div className="absolute top-0 left-0 right-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6) 30%, rgba(240,208,96,0.8) 50%, rgba(201,168,76,0.6) 70%, transparent)' }} />
        {/* Radial glows */}
        <div className="absolute pointer-events-none" style={{ top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-40px', left: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        {/* Decorative SVG arc rings */}
        <svg className="absolute right-0 top-0 h-full opacity-10 pointer-events-none" viewBox="0 0 200 200" fill="none">
          <circle cx="200" cy="100" r="80"  stroke="white" strokeWidth="1" />
          <circle cx="200" cy="100" r="120" stroke="white" strokeWidth="0.5" />
          <circle cx="200" cy="100" r="160" stroke="white" strokeWidth="0.3" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-white">
          <AnimateIn direction="up">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/category" className="hover:text-white transition-colors">Categories</Link>
              <span>/</span>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{category.name_en}</span>
            </div>

            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                {category.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                  {category.name_en}
                </h1>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {articles.length} article{articles.length !== 1 ? 's' : ''} · {category.name_ta}
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {articles.length === 0 ? (
          <AnimateIn direction="up" className="text-center py-24">
            <div className="text-5xl mb-4">{category.icon}</div>
            <p className="text-lg font-bold" style={{ color: 'var(--dark)' }}>No articles yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Articles in this category are coming soon.</p>
            <Link
              href="/category"
              className="inline-block mt-6 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: 'var(--green)', color: 'white' }}
            >
              ← Browse all categories
            </Link>
          </AnimateIn>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Main content */}
            <div className="flex-1 min-w-0">

              {/* Featured article — magazine style */}
              {featured && (
                <AnimateIn direction="up" className="mb-8">
                  <div
                    className="flex items-center gap-3 mb-5"
                    style={{ color: 'var(--dark)' }}
                  >
                    <div className="w-1 h-7 rounded-full" style={{ background: categoryText[featured.category] ?? 'var(--green)' }} />
                    <h2 className="text-xl font-extrabold">Featured in {category.name_en}</h2>
                  </div>

                  <Link
                    href={`/articles/${featured.slug}`}
                    className="group flex flex-col md:flex-row rounded-2xl overflow-hidden"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'white',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                    }}
                  >
                    {/* Image */}
                    <div
                      className="md:w-80 h-56 md:h-64 flex-shrink-0 relative overflow-hidden"
                      style={{ background: categoryColors[featured.category] ?? 'var(--green-light)' }}
                    >
                      {featured.featured_image ? (
                        <Image src={featured.featured_image} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 320px" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-7xl">{category.icon}</div>
                      )}
                      {featured.is_featured && (
                        <span
                          className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--gold)', color: 'var(--dark)' }}
                        >
                          ✦ Featured
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <span
                        className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-4 self-start"
                        style={{
                          background: categoryColors[featured.category] ?? '#f1f5f9',
                          color: categoryText[featured.category] ?? '#475569',
                        }}
                      >
                        {featured.category}
                      </span>
                      <h3
                        className="tamil-heading font-extrabold text-xl md:text-2xl mb-3"
                        style={{ color: 'var(--dark)', lineHeight: '1.5' }}
                      >
                        {featured.title}
                      </h3>
                      <p
                        className="tamil-text text-sm line-clamp-3 mb-5"
                        style={{ color: 'var(--muted)', lineHeight: '1.8' }}
                      >
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
                        <span>{featured.author} · {formatDate(featured.published_at)}</span>
                        <span>👁 {formatViews(featured.views)} views</span>
                      </div>
                      <span
                        className="mt-4 inline-flex items-center gap-1 text-sm font-bold"
                        style={{ color: categoryText[featured.category] ?? 'var(--green)' }}
                      >
                        Read article
                        <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                      </span>
                    </div>
                  </Link>
                </AnimateIn>
              )}

              {/* Rest of articles grid */}
              {rest.length > 0 && (
                <>
                  <AnimateIn direction="up" className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-7 rounded-full" style={{ background: 'var(--gold)' }} />
                    <h2 className="text-xl font-extrabold" style={{ color: 'var(--dark)' }}>More Articles</h2>
                  </AnimateIn>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rest.map((article, i) => (
                      <AnimateIn key={article.id} direction="up" delay={i * 80}>
                        <Link
                          href={`/articles/${article.slug}`}
                          className="group flex flex-col rounded-2xl overflow-hidden h-full"
                          style={{
                            border: '1px solid var(--border)',
                            background: 'white',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                          }}
                        >
                          <div
                            className="relative h-40 overflow-hidden flex-shrink-0"
                            style={{ background: categoryColors[article.category] ?? 'var(--green-light)' }}
                          >
                            {article.featured_image ? (
                              <Image src={article.featured_image} alt={article.title} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-5xl">{category.icon}</div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3
                              className="tamil-heading font-bold text-sm mb-2 line-clamp-2"
                              style={{ color: 'var(--dark)', lineHeight: '1.7' }}
                            >
                              {article.title}
                            </h3>
                            <p
                              className="tamil-text text-xs line-clamp-2 mb-4 flex-1"
                              style={{ color: 'var(--muted)', lineHeight: '1.8' }}
                            >
                              {article.excerpt}
                            </p>
                            <div
                              className="flex items-center justify-between text-xs pt-3"
                              style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
                            >
                              <span>{article.author}</span>
                              <span>👁 {formatViews(article.views)}</span>
                            </div>
                          </div>
                        </Link>
                      </AnimateIn>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="space-y-6 lg:sticky lg:top-6">

                {/* Category stats */}
                <AnimateIn direction="right" delay={100}>
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div
                      className="p-5 text-white text-center"
                      style={{ background: categoryGradients[slug] ?? 'var(--green)' }}
                    >
                      <div className="text-5xl mb-2">{category.icon}</div>
                      <div className="font-extrabold text-lg">{category.name_en}</div>
                      <div className="text-xs mt-1 opacity-75">{category.name_ta}</div>
                    </div>
                    <div
                      className="p-4 grid grid-cols-2 gap-3 text-center"
                      style={{ background: 'white' }}
                    >
                      <div>
                        <div className="text-xl font-black" style={{ color: 'var(--dark)' }}>{articles.length}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>Articles</div>
                      </div>
                      <div>
                        <div className="text-xl font-black" style={{ color: 'var(--dark)' }}>
                          {formatViews(articles.reduce((s, a) => s + a.views, 0))}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>Total Views</div>
                      </div>
                    </div>
                  </div>
                </AnimateIn>

                {/* Other categories */}
                <AnimateIn direction="right" delay={200}>
                  <div
                    className="rounded-2xl p-5"
                    style={{ border: '1px solid var(--border)', background: 'white' }}
                  >
                    <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--dark)' }}>
                      <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--green)' }} />
                      Other Categories
                    </h3>
                    <div className="space-y-2">
                      {otherCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                          style={{ border: '1px solid var(--border)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--green)'
                            e.currentTarget.style.borderColor = 'var(--green)'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.color = ''
                          }}
                        >
                          <span className="text-sm font-semibold">{cat.icon} {cat.name_en}</span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'var(--green-light)', color: 'var(--green)' }}
                          >
                            {cat.article_count}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/category"
                      className="block text-center text-xs font-bold mt-4 py-2 rounded-xl transition-all"
                      style={{ background: 'var(--green-light)', color: 'var(--green)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green-light)'; e.currentTarget.style.color = 'var(--green)' }}
                    >
                      View all categories →
                    </Link>
                  </div>
                </AnimateIn>

                <AdBanner position="sidebar" />

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}