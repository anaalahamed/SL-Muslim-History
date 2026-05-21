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
import { supabase } from '@/lib/supabase'

const quickActions = [
  { label: 'Write New Article', href: '/admin/articles/new',  icon: '📝', color: '#4a9e1f' },
  { label: 'Add News Post',     href: '/admin/news/new',      icon: '📰', color: '#0369a1' },
  { label: 'Add Category',      href: '/admin/categories',    icon: '🗂️', color: '#7c3aed' },
  { label: 'Upload Media',      href: '/admin/media',         icon: '🖼️', color: '#c2410c' },
  { label: 'View Newsletter',   href: '/admin/newsletter',    icon: '📬', color: '#a16207' },
  { label: 'Site Settings',     href: '/admin/settings',      icon: '⚙️', color: '#475569' },
]

export default function AdminDashboard() {
  const [ownerName,       setOwnerName]       = useState('Admin')
  const [articles,        setArticles]        = useState<Article[]>([])
  const [news,            setNews]            = useState<NewsPost[]>([])
  const [categoryCount,   setCategoryCount]   = useState(0)
  const [categories,      setCategories]      = useState<{id:string;icon:string;name_en:string;article_count:number}[]>([])
  const [subCount,        setSubCount]        = useState<number | null>(null)

  useEffect(() => {
    setOwnerName(getAdminConfig().ownerName || 'Admin')
    getArticles().then(setArticles)
    getNews().then(setNews)
    getCategories().then((cats) => { setCategoryCount(cats.length); setCategories(cats) })
    if (supabase) {
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true })
        .then(({ count }) => setSubCount(count ?? 0))
    }
  }, [])

  const totalViews     = articles.reduce((s, a) => s + a.views, 0)
  const recentArticles = [...articles].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 5)
  const recentNews     = [...news].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 4)

  const statCards = [
    { label: 'Total Articles', value: articles.length,   icon: '📝', color: '#4a9e1f', bg: '#f0fdf4',  href: '/admin/articles',   change: '+3 this month' },
    { label: 'News Posts',     value: news.length,       icon: '📰', color: '#0369a1', bg: '#f0f9ff',  href: '/admin/news',        change: '+2 this month' },
    { label: 'Categories',     value: categoryCount,     icon: '🗂️', color: '#7c3aed', bg: '#faf5ff',  href: '/admin/categories',  change: 'Active' },
    { label: 'Newsletter Subs',value: subCount !== null ? subCount.toLocaleString() : '—', icon: '📬', color: '#c2410c', bg: '#fff7ed', href: '/admin/newsletter', change: 'Subscribers' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Welcome banner */}
      <div
        className="rounded-2xl px-7 py-6 flex items-center justify-between gap-6"
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
            <div className="text-2xl font-black" style={{ color: '#c9a84c' }}>{news.filter(n => n.is_breaking).length}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Breaking</div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl p-5 transition-all duration-200"
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
              style={{ background: s.bg }}
            >
              {s.icon}
            </div>
            <div className="text-2xl font-black mb-0.5" style={{ color: '#0f172a' }}>{s.value}</div>
            <div className="text-xs font-semibold mb-1" style={{ color: '#64748b' }}>{s.label}</div>
            <div className="text-xs font-bold" style={{ color: s.color }}>{s.change}</div>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent articles */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
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
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: article.is_featured ? '#f0fdf4' : '#f8fafc',
                      color:      article.is_featured ? '#4a9e1f' : '#94a3b8',
                    }}
                  >
                    {article.is_featured ? '✦ Featured' : 'Draft'}
                  </span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>👁 {formatViews(article.views)}</span>
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
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
              {recentNews.map((news) => (
                <div key={news.id} className="flex items-start gap-3 px-5 py-3">
                  {news.is_breaking && (
                    <span
                      className="flex-shrink-0 text-xs font-black px-1.5 py-0.5 rounded mt-0.5"
                      style={{ background: '#fee2e2', color: '#dc2626' }}
                    >
                      🔴
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold line-clamp-2" style={{ color: '#1e293b', lineHeight: '1.5' }}>{news.title}</p>
                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{formatDate(news.published_at)}</p>
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
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl p-4 text-center"
              style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-xs font-bold truncate mb-1" style={{ color: '#1e293b' }}>{cat.name_en}</div>
              <div className="text-lg font-black" style={{ color: '#4a9e1f' }}>{cat.article_count}</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>articles</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
