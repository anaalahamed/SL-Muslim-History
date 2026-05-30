'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getArticles } from '@/lib/db/articles'
import { getNews } from '@/lib/db/news'
import { Article, NewsPost } from '@/lib/types'
import PageHero from '@/components/ui/PageHero'
import AnimateIn from '@/components/ui/AnimateIn'
import { formatDate } from '@/lib/utils'
import { SearchSkeleton } from '@/components/ui/Skeleton'
import AdBanner from '@/components/ui/AdBanner'

type Tab = 'all' | 'articles' | 'news'

export default function SearchClient() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults />
    </Suspense>
  )
}

function SearchResults() {
  const params = useSearchParams()
  const q      = params.get('q') ?? ''

  const [articles,  setArticles]  = useState<Article[]>([])
  const [news,      setNews]      = useState<NewsPost[]>([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState<Tab>('all')

  useEffect(() => {
    if (!q) { setLoading(false); return }
    setLoading(true)
    Promise.all([getArticles(), getNews()]).then(([a, n]) => {
      const term = q.toLowerCase()
      setArticles(a.filter((x) =>
        x.title.toLowerCase().includes(term) ||
        (x.excerpt ?? '').toLowerCase().includes(term) ||
        x.category.toLowerCase().includes(term) ||
        x.author.toLowerCase().includes(term)
      ))
      setNews(n.filter((x) =>
        x.title.toLowerCase().includes(term) ||
        (x.excerpt ?? '').toLowerCase().includes(term) ||
        (x.content ?? '').toLowerCase().includes(term)
      ))
      setLoading(false)
    })
  }, [q])

  const totalResults = articles.length + news.length

  const showArticles = tab === 'all' || tab === 'articles'
  const showNews     = tab === 'all' || tab === 'news'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHero
        badge="Search"
        title={q ? `Results for "${q}"` : 'Search'}
        subtitle={
          loading
            ? 'Searching...'
            : q
            ? `${totalResults} result${totalResults !== 1 ? 's' : ''} found`
            : 'Enter a keyword to search articles and news'
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <AdBanner position="banner" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Tab filter */}
        {!loading && q && totalResults > 0 && (
          <div className="flex gap-2 mb-8">
            {([
              { key: 'all',      label: `All (${totalResults})` },
              { key: 'articles', label: `Articles (${articles.length})` },
              { key: 'news',     label: `News (${news.length})` },
            ] as { key: Tab; label: string }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: tab === t.key ? 'var(--green)' : 'white',
                  color:      tab === t.key ? 'white'        : 'var(--muted)',
                  border:     `1px solid ${tab === t.key ? 'var(--green)' : 'var(--border)'}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        )}

        {!loading && !q && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Type something in the search bar above to get started.</p>
          </div>
        )}

        {!loading && q && totalResults === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😔</div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: 'var(--dark)' }}>No results found</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Try different keywords or browse our <Link href="/articles" style={{ color: 'var(--green)', fontWeight: 600 }}>articles</Link> and <Link href="/news" style={{ color: 'var(--green)', fontWeight: 600 }}>news</Link>.
            </p>
          </div>
        )}

        {!loading && q && totalResults > 0 && (
          <div className="space-y-8">

            {showArticles && articles.length > 0 && (
              <AnimateIn direction="up">
                <div>
                  {tab === 'all' && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--green)' }} />
                      <h2 className="font-extrabold text-base" style={{ color: 'var(--dark)' }}>Articles</h2>
                    </div>
                  )}
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="flex items-start gap-4 p-4 rounded-2xl transition-all"
                        style={{ background: 'white', border: '1px solid var(--border)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        {article.featured_image && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={article.featured_image} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                              {article.category}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatDate(article.published_at)}</span>
                          </div>
                          <h3 className="font-extrabold text-sm mb-1 line-clamp-1" style={{ color: 'var(--dark)' }}>{article.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)', lineHeight: '1.6' }}>{article.excerpt}</p>
                        </div>
                        <span className="text-sm flex-shrink-0" style={{ color: 'var(--green)' }}>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            )}

            {showNews && news.length > 0 && (
              <AnimateIn direction="up" delay={100}>
                <div>
                  {tab === 'all' && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
                      <h2 className="font-extrabold text-base" style={{ color: 'var(--dark)' }}>News</h2>
                    </div>
                  )}
                  <div className="space-y-3">
                    {news.map((post) => (
                      <Link
                        key={post.id}
                        href={`/news/${post.slug}`}
                        className="flex items-start gap-4 p-4 rounded-2xl transition-all"
                        style={{ background: 'white', border: '1px solid var(--border)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        {post.featured_image && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={post.featured_image} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={post.news_type === 'janaza'
                                ? { background: '#f0f9ff', color: '#0369a1' }
                                : { background: '#f0fdf4', color: '#166534' }}
                            >
                              {post.news_type === 'janaza' ? 'Janaza' : 'சிறப்பு'}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatDate(post.published_at)}</span>
                          </div>
                          <h3 className="font-extrabold text-sm mb-1 line-clamp-1" style={{ color: 'var(--dark)' }}>{post.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)', lineHeight: '1.6' }}>{post.content?.split('\n\n')[0] ?? ''}</p>
                        </div>
                        <span className="text-sm flex-shrink-0" style={{ color: 'var(--green)' }}>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
