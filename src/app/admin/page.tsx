'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getArticles } from '@/lib/db/articles'
import { getNews } from '@/lib/db/news'
import { getCategories } from '@/lib/db/categories'
import { getMessages } from '@/lib/db/contact'
import { Article } from '@/lib/types'
import { NewsPost } from '@/lib/types'
import { formatDate, formatViews } from '@/lib/utils'
import { getAdminConfig } from '@/lib/adminConfig'
import { getAuthClient } from '@/lib/supabase-auth'
import { theme, accents, cardStyle, AccentKey } from './adminTheme'

const quickActions = [
  { label: 'Write New Article', href: '/admin/articles/new',  icon: '📝', accent: 'violet' as AccentKey },
  { label: 'Add News Post',     href: '/admin/news/new',      icon: '📰', accent: 'blue' as AccentKey },
  { label: 'Add Category',      href: '/admin/categories',    icon: '🗂️', accent: 'pink' as AccentKey },
  { label: 'Upload Media',      href: '/admin/media',         icon: '🖼️', accent: 'cyan' as AccentKey },
  { label: 'View Newsletter',   href: '/admin/newsletter',    icon: '📬', accent: 'emerald' as AccentKey },
  { label: 'Site Settings',     href: '/admin/settings',      icon: '⚙️', accent: 'amber' as AccentKey },
]

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const isWithinLast30Days = (dateStr: string) => new Date(dateStr).getTime() > Date.now() - THIRTY_DAYS_MS

interface CommentRow { status: string; created_at: string }
interface ReactionRow { emoji: string | null; created_at: string }
interface SubscriberRow { status: string }

export default function AdminDashboard() {
  const [ownerName,       setOwnerName]       = useState('Admin')
  const [articles,        setArticles]        = useState<Article[]>([])
  const [news,            setNews]            = useState<NewsPost[]>([])
  const [categoryCount,   setCategoryCount]   = useState(0)
  const [categories,      setCategories]      = useState<{id:string;icon:string;name_en:string;article_count:number}[]>([])
  const [subscribers,     setSubscribers]     = useState<SubscriberRow[]>([])
  const [comments,        setComments]        = useState<CommentRow[]>([])
  const [reactions,       setReactions]       = useState<ReactionRow[]>([])
  const [messages,        setMessages]        = useState<{ read: boolean }[]>([])
  const [hoveredMonth,    setHoveredMonth]     = useState<number | null>(null)

  useEffect(() => {
    setOwnerName(getAdminConfig().ownerName || 'Admin')
    getArticles(getAuthClient()).then(setArticles)
    getNews(getAuthClient()).then(setNews)
    getCategories().then((cats) => { setCategoryCount(cats.length); setCategories(cats) })
    getAuthClient().from('newsletter_subscribers').select('status')
        .then(({ data }) => setSubscribers(data ?? []))
    getAuthClient().from('comments').select('status, created_at')
        .then(({ data }) => setComments(data ?? []))
    getAuthClient().from('reactions').select('emoji, created_at')
        .then(({ data }) => setReactions((data ?? []).filter((r) => r.emoji))) // exclude removed reactions
    getMessages(getAuthClient()).then(setMessages)
  }, [])

  const totalViews     = articles.reduce((s, a) => s + a.views, 0)
  const recentArticles = [...articles].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 5)

  // Real (organic) view totals, per section — for the welcome banner
  const realArticleViews = articles.reduce((s, a) => s + (a.real_views ?? a.views), 0)
  const realSpecialViews = news.filter((n) => n.news_type === 'special').reduce((s, n) => s + (n.real_views ?? n.views ?? 0), 0)
  const realJanazaViews  = news.filter((n) => n.news_type === 'janaza').reduce((s, n) => s + (n.real_views ?? n.views ?? 0), 0)

  const articlesThisMonth  = articles.filter((a) => isWithinLast30Days(a.published_at)).length
  const newsThisMonth      = news.filter((n) => isWithinLast30Days(n.published_at)).length
  const commentsApproved   = comments.filter((c) => c.status === 'approved').length
  const commentsPending    = comments.filter((c) => c.status === 'pending').length
  const reactionsThisMonth = reactions.filter((r) => isWithinLast30Days(r.created_at)).length
  const subsAccepted       = subscribers.filter((s) => s.status === 'accepted').length
  const subsPending        = subscribers.filter((s) => s.status === 'pending').length
  const messagesRead       = messages.filter((m) => m.read).length
  const messagesPending    = messages.filter((m) => !m.read).length

  // Ranked by real (organic) views, not the boosted total, so an admin-set
  // boost can't make an article look more popular than it actually is here.
  const topArticles     = [...articles].sort((a, b) => (b.real_views ?? b.views) - (a.real_views ?? a.views)).slice(0, 5)
  const topSpecialNews  = news.filter((n) => n.news_type === 'special').sort((a, b) => (b.real_views ?? b.views ?? 0) - (a.real_views ?? a.views ?? 0)).slice(0, 5)
  const topJanazaNews   = news.filter((n) => n.news_type === 'janaza').sort((a, b) => (b.real_views ?? b.views ?? 0) - (a.real_views ?? a.views ?? 0)).slice(0, 5)

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

  const statCards: { label: string; value: number; icon: string; accent: AccentKey; href: string; change: string }[] = [
    { label: 'Articles',   value: articles.length,   icon: '📝', accent: 'violet', href: '/admin/articles',   change: `+${articlesThisMonth} mo.` },
    { label: 'News Posts', value: news.length,       icon: '📰', accent: 'blue',   href: '/admin/news',        change: `+${newsThisMonth} mo.` },
    { label: 'Categories', value: categoryCount,     icon: '🗂️', accent: 'pink',   href: '/admin/categories',  change: 'Active' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Welcome banner */}
      <div
        className="rounded-2xl px-5 sm:px-7 py-5 sm:py-6 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(120deg, #7c3aed 0%, #6366f1 50%, #ec4899 100%)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '20%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="relative">
          <h2 className="text-xl font-extrabold mb-1 text-white">Welcome back, {ownerName} 👋</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Here&apos;s what&apos;s happening with SL Muslim History today.
          </p>
        </div>
        <div className="relative hidden sm:flex items-center gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-white">{formatViews(totalViews)}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Views</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.25)' }} />
          <div title="Real (organic) article views">
            <div className="text-2xl font-black text-white">{formatViews(realArticleViews)}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Articles</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.25)' }} />
          <div title="Real (organic) special news views">
            <div className="text-2xl font-black text-white">{formatViews(realSpecialViews)}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Special</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.25)' }} />
          <div title="Real (organic) janaza news views">
            <div className="text-2xl font-black text-white">{formatViews(realJanazaViews)}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Janaza</div>
          </div>
        </div>
      </div>

      {/* Stat cards — all six in one compact row: heading, then emoji + count + this-month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {statCards.map((s) => {
          const a = accents[s.accent]
          return (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-xl p-2.5 transition-all duration-200 min-w-0"
              style={cardStyle}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = a.glow; e.currentTarget.style.boxShadow = `0 8px 24px ${a.glow}` }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="text-xs font-semibold truncate mb-1.5" style={{ color: theme.textSecondary }}>{s.label}</div>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-sm">{s.icon}</span>
                <span className="text-lg font-black" style={{ color: theme.textPrimary }}>{s.value}</span>
                <span className="text-xs font-bold truncate" style={{ color: a.solid }}>{s.change}</span>
              </div>
            </Link>
          )
        })}

        {/* Newsletter Subs — three counts squeezed into the same compact card */}
        <Link
          href="/admin/newsletter"
          className="rounded-xl p-2.5 transition-all duration-200 min-w-0"
          style={cardStyle}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = accents.emerald.glow; e.currentTarget.style.boxShadow = `0 8px 24px ${accents.emerald.glow}` }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div className="text-xs font-semibold truncate mb-1.5" style={{ color: theme.textSecondary }}>Newsletter</div>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm">📬</span>
            <span className="text-lg font-black" style={{ color: theme.textPrimary }}>{subscribers.length}</span>
            <span className="text-xs font-bold" style={{ color: accents.emerald.solid }}>✓{subsAccepted}</span>
            <span className="text-xs font-bold" style={{ color: accents.amber.solid }}>⏳{subsPending}</span>
          </div>
        </Link>

        {/* Comments — three counts squeezed into the same compact card */}
        <Link
          href="/admin/comments"
          className="rounded-xl p-2.5 transition-all duration-200 min-w-0"
          style={cardStyle}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = accents.cyan.glow; e.currentTarget.style.boxShadow = `0 8px 24px ${accents.cyan.glow}` }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div className="text-xs font-semibold truncate mb-1.5" style={{ color: theme.textSecondary }}>Comments</div>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm">💬</span>
            <span className="text-lg font-black" style={{ color: theme.textPrimary }}>{comments.length}</span>
            <span className="text-xs font-bold" style={{ color: accents.emerald.solid }}>✓{commentsApproved}</span>
            <span className="text-xs font-bold" style={{ color: accents.amber.solid }}>⏳{commentsPending}</span>
          </div>
        </Link>

        {/* Messages — three counts squeezed into the same compact card */}
        <Link
          href="/admin/messages"
          className="rounded-xl p-2.5 transition-all duration-200 min-w-0"
          style={cardStyle}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = accents.rose.glow; e.currentTarget.style.boxShadow = `0 8px 24px ${accents.rose.glow}` }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div className="text-xs font-semibold truncate mb-1.5" style={{ color: theme.textSecondary }}>Messages</div>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm">✉️</span>
            <span className="text-lg font-black" style={{ color: theme.textPrimary }}>{messages.length}</span>
            <span className="text-xs font-bold" style={{ color: accents.emerald.solid }}>✓{messagesRead}</span>
            <span className="text-xs font-bold" style={{ color: accents.amber.solid }}>⏳{messagesPending}</span>
          </div>
        </Link>

        {/* Reactions */}
        <Link
          href="/admin/reactions"
          className="rounded-xl p-2.5 transition-all duration-200 min-w-0"
          style={cardStyle}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = accents.amber.glow; e.currentTarget.style.boxShadow = `0 8px 24px ${accents.amber.glow}` }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div className="text-xs font-semibold truncate mb-1.5" style={{ color: theme.textSecondary }}>Reactions</div>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm">⭐</span>
            <span className="text-lg font-black" style={{ color: theme.textPrimary }}>{reactions.length}</span>
            <span className="text-xs font-bold truncate" style={{ color: accents.rose.solid }}>+{reactionsThisMonth} mo.</span>
          </div>
        </Link>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

        {/* Recent articles */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: `1px solid ${theme.divider}` }}
          >
            <h3 className="font-extrabold text-sm" style={{ color: theme.textPrimary }}>Recent Articles</h3>
            <Link
              href="/admin/articles"
              className="text-xs font-bold transition-colors"
              style={{ color: accents.violet.solid }}
            >
              View all →
            </Link>
          </div>
          <div>
            {recentArticles.map((article, i) => (
              <div
                key={article.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{ borderBottom: i < recentArticles.length - 1 ? `1px solid ${theme.divider}` : 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Number */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={i === 0
                    ? { background: accents.violet.grad, color: 'white', boxShadow: `0 0 12px ${accents.violet.glow}` }
                    : { background: 'rgba(255,255,255,0.05)', color: theme.textMuted }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>{article.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{article.category} · {formatDate(article.published_at)}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {article.status === 'draft' && (
                    <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: accents.amber.soft, color: accents.amber.solid }}>
                      📝 Draft
                    </span>
                  )}
                  <span
                    className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={article.is_featured
                      ? { background: accents.violet.soft, color: accents.violet.solid }
                      : { background: 'rgba(255,255,255,0.05)', color: theme.textMuted }}
                  >
                    {article.is_featured ? '✦ Featured' : 'Regular'}
                  </span>
                  <span className="hidden sm:inline text-xs" style={{ color: theme.textMuted }} title="Real (organic) views">👁 {formatViews(article.real_views ?? article.views)}</span>
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: theme.textSecondary }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = accents.violet.grad; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = theme.textSecondary }}
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
        <div className="rounded-2xl" style={cardStyle}>
          <div className="px-5 py-4 rounded-t-2xl" style={{ borderBottom: `1px solid ${theme.divider}` }}>
            <h3 className="font-extrabold text-sm" style={{ color: theme.textPrimary }}>Publishing Activity</h3>
            <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>Articles published per month</p>
          </div>
          <div className="px-8 py-6 flex items-end justify-center gap-6 sm:gap-10" style={{ height: 160 }}>
            {monthlyPublished.map((m, i) => {
              const barHeight = m.count === 0 ? 3 : Math.max(10, (m.count / maxMonthlyCount) * 110)
              return (
                <div key={`${m.label}-${m.year}`} className="flex flex-col items-center gap-2" style={{ position: 'relative', width: 40 }}>
                  {hoveredMonth === i && (
                    <div
                      role="tooltip"
                      className="absolute text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{
                        bottom: barHeight + 32,
                        background: '#1a1030',
                        border: `1px solid ${accents.violet.glow}`,
                        color: 'white',
                        zIndex: 10,
                      }}
                    >
                      {m.label} {m.year}: {m.count} article{m.count !== 1 ? 's' : ''}
                    </div>
                  )}
                  <span className="text-xs font-black" style={{ color: theme.textPrimary }}>{m.count}</span>
                  <div
                    onMouseEnter={() => setHoveredMonth(i)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    style={{
                      width: '100%',
                      height: barHeight,
                      background: hoveredMonth === i
                        ? 'linear-gradient(180deg,#a78bfa,#3b82f6)'
                        : 'linear-gradient(180deg,#8b5cf6,#3b82f6)',
                      borderRadius: '8px 8px 0 0',
                      boxShadow: hoveredMonth === i ? `0 0 16px ${accents.violet.glow}` : 'none',
                      transition: 'box-shadow 0.15s',
                      cursor: 'default',
                    }}
                  />
                  <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top performing articles */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: `1px solid ${theme.divider}` }}
          >
            <h3 className="font-extrabold text-sm" style={{ color: theme.textPrimary }}>Top Performing Articles</h3>
            <Link href="/admin/articles" className="text-xs font-bold" style={{ color: accents.violet.solid }}>View all →</Link>
          </div>
          <div>
            {topArticles.length === 0 ? (
              <p className="text-sm px-5 py-6" style={{ color: theme.textMuted }}>No articles yet.</p>
            ) : (
              topArticles.map((article, i) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ borderBottom: i < topArticles.length - 1 ? `1px solid ${theme.divider}` : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={i === 0
                      ? { background: accents.amber.grad, color: 'white', boxShadow: `0 0 12px ${accents.amber.glow}` }
                      : { background: 'rgba(255,255,255,0.05)', color: theme.textMuted }}
                  >
                    {i === 0 ? '🏆' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>{article.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{article.category}</p>
                  </div>
                  <span className="text-sm font-black flex-shrink-0" style={{ color: accents.violet.solid }} title="Real (organic) views">
                    👁 {formatViews(article.real_views ?? article.views)}
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
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${theme.divider}` }}>
              <h3 className="font-extrabold text-sm" style={{ color: theme.textPrimary }}>Quick Actions</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {quickActions.map((a) => {
                const c = accents[a.accent]
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all text-xs font-semibold"
                    style={{ border: '1px solid rgba(255,255,255,0.06)', color: theme.textSecondary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = c.soft
                      e.currentTarget.style.borderColor = c.glow
                      e.currentTarget.style.color = c.solid
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = theme.textSecondary
                    }}
                  >
                    <span className="text-xl">{a.icon}</span>
                    {a.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Top performing special news */}
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${theme.divider}` }}
            >
              <h3 className="font-extrabold text-sm" style={{ color: theme.textPrimary }}>Top Special News</h3>
              <Link href="/admin/news" className="text-xs font-bold" style={{ color: accents.violet.solid }}>View all →</Link>
            </div>
            <div>
              {topSpecialNews.length === 0 ? (
                <p className="text-sm px-5 py-6" style={{ color: theme.textMuted }}>No special news yet.</p>
              ) : (
                topSpecialNews.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                    style={{ borderBottom: i < topSpecialNews.length - 1 ? `1px solid ${theme.divider}` : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={i === 0
                        ? { background: accents.emerald.grad, color: 'white', boxShadow: `0 0 12px ${accents.emerald.glow}` }
                        : { background: 'rgba(255,255,255,0.05)', color: theme.textMuted }}
                    >
                      {i === 0 ? '🏆' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>{item.title}</p>
                    </div>
                    <span className="text-sm font-black flex-shrink-0" style={{ color: accents.violet.solid }} title="Real (organic) views">
                      👁 {formatViews(item.real_views ?? item.views ?? 0)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top performing janaza news */}
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${theme.divider}` }}
            >
              <h3 className="font-extrabold text-sm" style={{ color: theme.textPrimary }}>Top Janaza News</h3>
              <Link href="/admin/news" className="text-xs font-bold" style={{ color: accents.violet.solid }}>View all →</Link>
            </div>
            <div>
              {topJanazaNews.length === 0 ? (
                <p className="text-sm px-5 py-6" style={{ color: theme.textMuted }}>No janaza news yet.</p>
              ) : (
                topJanazaNews.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                    style={{ borderBottom: i < topJanazaNews.length - 1 ? `1px solid ${theme.divider}` : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={i === 0
                        ? { background: accents.blue.grad, color: 'white', boxShadow: `0 0 12px ${accents.blue.glow}` }
                        : { background: 'rgba(255,255,255,0.05)', color: theme.textMuted }}
                    >
                      {i === 0 ? '🏆' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>{item.title}</p>
                    </div>
                    <span className="text-sm font-black flex-shrink-0" style={{ color: accents.violet.solid }} title="Real (organic) views">
                      👁 {formatViews(item.real_views ?? item.views ?? 0)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Category overview */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${theme.divider}` }}
        >
          <h3 className="font-extrabold text-sm" style={{ color: theme.textPrimary }}>Category Overview</h3>
          <Link href="/admin/categories" className="text-xs font-bold" style={{ color: accents.violet.solid }}>Manage →</Link>
        </div>
        <div className="p-4 flex flex-wrap gap-2.5">
          {categories.map((cat, i) => {
            const keys = Object.keys(accents) as AccentKey[]
            const a = accents[keys[i % keys.length]]
            return (
              <div
                key={cat.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${a.glow}` }}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-bold whitespace-nowrap" style={{ color: theme.textPrimary }}>{cat.name_en}</span>
                <span className="text-xs font-black" style={{ color: a.solid }}>{cat.article_count}</span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
