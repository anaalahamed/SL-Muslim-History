'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getArticles } from '@/lib/db/articles'
import { getNews } from '@/lib/db/news'
import { getCategories } from '@/lib/db/categories'
import { Article } from '@/lib/types'
import { NewsPost } from '@/lib/types'
import { formatDate, formatViews } from '@/lib/utils'
import { getAdminConfig } from '@/lib/adminConfig'
import { getAuthClient } from '@/lib/supabase-auth'

const quickActions = [
  { label: 'Write New Article', href: '/admin/articles/new',  icon: '📝', color: '#4a9e1f' },
  { label: 'Add News Post',     href: '/admin/news/new',      icon: '📰', color: '#0369a1' },
  { label: 'Add Category',      href: '/admin/categories',    icon: '🗂️', color: '#7c3aed' },
  { label: 'Upload Media',      href: '/admin/media',         icon: '🖼️', color: '#c2410c' },
  { label: 'View Newsletter',   href: '/admin/newsletter',    icon: '📬', color: '#a16207' },
  { label: 'Database Setup',    href: '/admin/setup',         icon: '🔧', color: '#b45309' },
  { label: 'Site Settings',     href: '/admin/settings',      icon: '⚙️', color: '#475569' },
]

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const isWithinLast30Days = (dateStr: string) => new Date(dateStr).getTime() > Date.now() - THIRTY_DAYS_MS

interface CommentRow { status: string; created_at: string }
interface ReactionRow { emoji: string | null; created_at: string }

export default function AdminDashboard() {
  const [ownerName,       setOwnerName]       = useState('Admin')
  const [articles,        setArticles]        = useState<Article[]>([])
  const [news,            setNews]            = useState<NewsPost[]>([])
  const [categoryCount,   setCategoryCount]   = useState(0)
  const [categories,      setCategories]      = useState<{id:string;icon:string;name_en:string;article_count:number}[]>([])
  const [subCount,        setSubCount]        = useState<number | null>(null)
  const [comments,        setComments]        = useState<CommentRow[]>([])
  const [reactions,       setReactions]       = useState<ReactionRow[]>([])
  const [hoveredMonth,    setHoveredMonth]     = useState<number | null>(null)

  useEffect(() => {
    setOwnerName(getAdminConfig().ownerName || 'Admin')
    getArticles(getAuthClient()).then(setArticles)
    getNews(getAuthClient()).then(setNews)
    getCategories().then((cats) => { setCategoryCount(cats.length); setCategories(cats) })
    getAuthClient().from('newsletter_subscribers').select('*', { count: 'exact', head: true })
        .then(({ count }) => setSubCount(count ?? 0))
    getAuthClient().from('comments').select('status, created_at')
        .then(({ data }) => setComments(data ?? []))
    getAuthClient().from('reactions').select('emoji, created_at')
        .then(({ data }) => setReactions((data ?? []).filter((r) => r.emoji))) // exclude removed reactions
  }, [])

  const totalViews     = articles.reduce((s, a) => s + a.views, 0)
  const recentArticles = [...articles].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 5)
  const recentNews     = [...news].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 4)

  const articlesThisMonth  = articles.filter((a) => isWithinLast30Days(a.published_at)).length
  const newsThisMonth      = news.filter((n) => isWithinLast30Days(n.published_at)).length
  const commentsApproved   = comments.filter((c) => c.status === 'approved').length
  const commentsPending    = comments.filter((c) => c.status === 'pending').length
  const commentsThisMonth  = comments.filter((c) => isWithinLast30Days(c.created_at)).length
  const reactionsThisMonth = reactions.filter((r) => isWithinLast30Days(r.created_at)).length

  const topArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)

  const monthlyPublished = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1) // avoid month-length rollover (e.g. Mar 31 - 1 month != Feb)
    d.setMonth(d.getMonth() - (5 - i))
    const count = articles.filter((a) => {
      const pd = new Date(a.published_at)
      return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth()
    }).length
    return { label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), count }
  })
  const maxMonthlyCount = Math.max(1, ...monthlyPublished.map((m) => m.count))

  const statCards = [
    { label: 'Total Articles', value: articles.length,   icon: '📝', color: '#4a9e1f', href: '/admin/articles',   change: `+${articlesThisMonth} this month` },
    { label: 'News Posts',     value: news.length,       icon: '📰', color: '#0369a1', href: '/admin/news',        change: `+${newsThisMonth} this month` },
    { label: 'Categories',     value: categoryCount,     icon: '🗂️', color: '#7c3aed', href: '/admin/categories',  change: 'Active' },
    { label: 'Newsletter Subs',value: subCount !== null ? subCount.toLocaleString() : '—', icon: '📬', color: '#c2410c', href: '/admin/newsletter', change: 'Subscribers' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Welcome banner */}
      <div
        className="rounded-2xl px-5 sm:px-7 py-5 sm:py-6 flex flex-wrap items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #1a3a0f 0%, #2d6112 100%)', color: 'white' }}
      >
        <div>
          <h2 className="text-xl font-extrabold mb-1">Welcome back, {ownerName} 👋</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Here&apos;s what&apos;s happening with SL Muslim History today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-center">
          <div>
            <div className="text-2xl font-black" style={{ color: '#c9a84c' }}>{formatViews(totalViews)}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Views</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.15)' }} />
          <div>
            <div className="text-2xl font-black" style={{ color: '#c9a84c' }}>{articles.filter(a => a.is_featured).length}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Featured</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.15)' }} />
          <div>
            <div className="text-2xl font-black" style={{ color: '#c9a84c' }}>{news.filter(n => n.news_type === 'special').length}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Special</div>
          </div>
        </div>
      </div>

      {/* Stat cards — all six in one compact row: heading, then emoji + count + this-month */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl p-3 transition-all duration-200 min-w-0"
            style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-semibold truncate mb-1.5" style={{ color: '#64748b' }}>{s.label}</div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm">{s.icon}</span>
              <span className="text-lg font-black" style={{ color: '#0f172a' }}>{s.value}</span>
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.change}</span>
            </div>
          </Link>
        ))}

        {/* Comments — three counts squeezed into the same compact card */}
        <Link
          href="/admin/comments"
          className="rounded-xl p-3 transition-all duration-200 min-w-0"
          style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
        >
          <div className="text-xs font-semibold truncate mb-1.5" style={{ color: '#64748b' }}>Comments</div>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm">💬</span>
            <span className="text-lg font-black" style={{ color: '#0f172a' }}>{comments.length}</span>
            <span className="text-xs font-bold" style={{ color: '#15803d' }}>✓{commentsApproved}</span>
            <span className="text-xs font-bold" style={{ color: '#b45309' }}>⏳{commentsPending}</span>
          </div>
        </Link>

        {/* Reactions */}
        <Link
          href="/admin/reactions"
          className="rounded-xl p-3 transition-all duration-200 min-w-0"
          style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
        >
          <div className="text-xs font-semibold truncate mb-1.5" style={{ color: '#64748b' }}>Reactions</div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm">⭐</span>
            <span className="text-lg font-black" style={{ color: '#0f172a' }}>{reactions.length}</span>
            <span className="text-xs font-bold" style={{ color: '#dc2626' }}>+{reactionsThisMonth} this month</span>
          </div>
        </Link>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

        {/* Recent articles */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid #e2e8f0' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #f1f5f9' }}
          >
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Recent Articles</h3>
            <Link
              href="/admin/articles"
              className="text-xs font-bold transition-colors"
              style={{ color: '#4a9e1f' }}
            >
              View all →
            </Link>
          </div>
          <div>
            {recentArticles.map((article, i) => (
              <div
                key={article.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{ borderBottom: i < recentArticles.length - 1 ? '1px solid #f8fafc' : 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Number */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: i === 0 ? '#4a9e1f' : '#f1f5f9', color: i === 0 ? 'white' : '#94a3b8' }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{article.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{article.category} · {formatDate(article.published_at)}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {article.status === 'draft' && (
                    <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#fef9c3', color: '#a16207' }}>
                      📝 Draft
                    </span>
                  )}
                  <span
                    className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: article.is_featured ? '#f0fdf4' : '#f8fafc',
                      color:      article.is_featured ? '#4a9e1f' : '#94a3b8',
                    }}
                  >
                    {article.is_featured ? '✦ Featured' : 'Regular'}
                  </span>
                  <span className="hidden sm:inline text-xs" style={{ color: '#94a3b8' }}>👁 {formatViews(article.views)}</span>
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: '#f1f5f9', color: '#475569' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publishing activity — articles published per month, last 6 months.
            No overflow-hidden here (unlike other cards): the hover tooltip on
            the first/last bar needs to be able to spill past the card edge. */}
        <div
          className="rounded-2xl"
          style={{ background: 'white', border: '1px solid #e2e8f0' }}
        >
          <div className="px-5 py-4 rounded-t-2xl" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Publishing Activity</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Articles published per month</p>
          </div>
          <div className="px-5 py-6 flex items-end justify-between gap-2" style={{ height: 160 }}>
            {monthlyPublished.map((m, i) => {
              const barHeight = m.count === 0 ? 3 : Math.max(10, (m.count / maxMonthlyCount) * 110)
              return (
                <div key={`${m.label}-${m.year}`} className="flex-1 flex flex-col items-center gap-2" style={{ position: 'relative' }}>
                  {hoveredMonth === i && (
                    <div
                      role="tooltip"
                      className="absolute text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{
                        bottom: barHeight + 32,
                        background: '#0f172a',
                        color: 'white',
                        zIndex: 10,
                      }}
                    >
                      {m.label} {m.year}: {m.count} article{m.count !== 1 ? 's' : ''}
                    </div>
                  )}
                  <span className="text-xs font-black" style={{ color: '#0f172a' }}>{m.count}</span>
                  <div
                    onMouseEnter={() => setHoveredMonth(i)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    style={{
                      width: '100%',
                      maxWidth: 28,
                      height: barHeight,
                      background: hoveredMonth === i ? '#3d8a1f' : '#4a9e1f',
                      borderRadius: '4px 4px 0 0',
                      transition: 'background 0.15s',
                      cursor: 'default',
                    }}
                  />
                  <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top performing articles */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid #e2e8f0' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #f1f5f9' }}
          >
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Top Performing Articles</h3>
            <Link href="/admin/articles" className="text-xs font-bold" style={{ color: '#4a9e1f' }}>View all →</Link>
          </div>
          <div>
            {topArticles.length === 0 ? (
              <p className="text-sm px-5 py-6" style={{ color: '#94a3b8' }}>No articles yet.</p>
            ) : (
              topArticles.map((article, i) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ borderBottom: i < topArticles.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: i === 0 ? '#c2410c' : '#f1f5f9', color: i === 0 ? 'white' : '#94a3b8' }}
                  >
                    {i === 0 ? '🏆' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{article.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{article.category}</p>
                  </div>
                  <span className="text-sm font-black flex-shrink-0" style={{ color: '#4a9e1f' }}>
                    👁 {formatViews(article.views)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Quick actions */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Quick Actions</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all text-xs font-semibold"
                  style={{ border: '1px solid #f1f5f9', color: '#475569' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = a.color + '12'
                    e.currentTarget.style.borderColor = a.color + '40'
                    e.currentTarget.style.color = a.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = '#f1f5f9'
                    e.currentTarget.style.color = '#475569'
                  }}
                >
                  <span className="text-xl">{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent news */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}
            >
              <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Recent News</h3>
              <Link href="/admin/news" className="text-xs font-bold" style={{ color: '#4a9e1f' }}>View all →</Link>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
              {recentNews.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded mt-0.5"
                    style={item.news_type === 'janaza'
                      ? { background: '#f0f9ff', color: '#0369a1' }
                      : { background: '#f0fdf4', color: '#166534' }}
                  >
                    {item.news_type === 'janaza' ? 'J' : 'S'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold line-clamp-2" style={{ color: '#1e293b', lineHeight: '1.5' }}>
                      {item.status === 'draft' && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded mr-1" style={{ background: '#fef9c3', color: '#a16207' }}>📝 Draft</span>
                      )}
                      {item.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                      {formatDate(item.published_at)} · 👁 {formatViews(item.views ?? 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Category overview */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #e2e8f0' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #f1f5f9' }}
        >
          <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Category Overview</h3>
          <Link href="/admin/categories" className="text-xs font-bold" style={{ color: '#4a9e1f' }}>Manage →</Link>
        </div>
        <div className="p-4 flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#1e293b' }}>{cat.name_en}</span>
              <span className="text-xs font-black" style={{ color: '#4a9e1f' }}>{cat.article_count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
