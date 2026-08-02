'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getAdminConfig } from '@/lib/adminConfig'
import { getUnreadCount } from '@/lib/db/contact'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { getAuthClient } from '@/lib/supabase-auth'
import { theme, accents } from './adminTheme'

const navItems = [
  { label: 'Dashboard',   href: '/admin',              icon: '📊', accent: 'violet' as const },
  { label: 'Backup',      href: '/admin/backup',        icon: '🗄️', accent: 'blue' as const },
  { label: 'Articles',    href: '/admin/articles',      icon: '📝', accent: 'violet' as const },
  { label: 'News',        href: '/admin/news',          icon: '📰', accent: 'blue' as const },
  { label: 'Categories',  href: '/admin/categories',    icon: '🗂️', accent: 'pink' as const },
  { label: 'Authors',     href: '/admin/authors',        icon: '✍️', accent: 'cyan' as const },
  { label: 'Comments',    href: '/admin/comments',      icon: '💬', accent: 'cyan' as const },
  { label: 'Reactions',   href: '/admin/reactions',     icon: '⭐', accent: 'amber' as const },
  { label: 'Messages',    href: '/admin/messages',      icon: '✉️', accent: 'rose' as const },
  { label: 'Ads',          href: '/admin/ads',            icon: '📢', accent: 'pink' as const },
  { label: 'Newsletter',  href: '/admin/newsletter',    icon: '📬', accent: 'emerald' as const },
  { label: 'Settings',    href: '/admin/settings',      icon: '⚙️', accent: 'violet' as const },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [ownerName,     setOwnerName]     = useState('Admin')
  const [unreadMsgs,    setUnreadMsgs]    = useState(0)
  const [newSubs,       setNewSubs]       = useState(0)
  const [pendingComments, setPendingComments] = useState(0)
  const [newReactions,  setNewReactions]  = useState(0)

  // Load owner name from config (fall back to authenticated user's email)
  useEffect(() => {
    const config = getAdminConfig()
    if (config.ownerName) {
      setOwnerName(config.ownerName)
      return
    }
    getAuthClient().auth.getUser().then(({ data: { user } }) => {
      setOwnerName(user?.email?.split('@')[0] ?? 'Admin')
    })
  }, [pathname]) // re-read on every nav so Settings changes reflect immediately

  // Poll unread message count
  useEffect(() => {
    getUnreadCount(getAuthClient()).then(setUnreadMsgs)
    const interval = setInterval(() => getUnreadCount(getAuthClient()).then(setUnreadMsgs), 5000)
    return () => clearInterval(interval)
  }, [pathname])

  // Poll pending comment count
  useEffect(() => {
    async function checkPendingComments() {
      const { count } = await getAuthClient()
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      setPendingComments(count ?? 0)
    }
    checkPendingComments()
    const interval = setInterval(checkPendingComments, 5000)
    return () => clearInterval(interval)
  }, [pathname])

  // Poll new newsletter subscribers since last viewed
  useEffect(() => {
    async function checkNewSubs() {
      const authClient = getAuthClient()
      const settings = await getSiteSettings()
      const lastViewed = settings?.newsletterLastViewed
      if (!lastViewed) {
        const { count } = await authClient
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
        setNewSubs(count ?? 0)
        return
      }
      const { count } = await authClient
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .gt('subscribed_at', lastViewed)
      setNewSubs(count ?? 0)
    }
    checkNewSubs()
    const interval = setInterval(checkNewSubs, 30000)
    return () => clearInterval(interval)
  }, [pathname])

  // Poll new reactions since last viewed
  useEffect(() => {
    async function checkNewReactions() {
      const authClient = getAuthClient()
      const settings = await getSiteSettings()
      const lastViewed = settings?.reactionsLastViewed
      if (!lastViewed) {
        const { count } = await authClient
          .from('reactions')
          .select('*', { count: 'exact', head: true })
        setNewReactions(count ?? 0)
        return
      }
      const { count } = await authClient
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .gt('updated_at', lastViewed)
      setNewReactions(count ?? 0)
    }
    checkNewReactions()
    const interval = setInterval(checkNewReactions, 10000)
    return () => clearInterval(interval)
  }, [pathname])

  // Don't render layout on login page
  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex" style={{ background: theme.pageBgLayers, fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '240px',
          background: theme.sidebarBg,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: `1px solid ${theme.divider}` }}
        >
          <div
            className="rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: 'white', padding: '4px', boxShadow: `0 0 20px ${accents.violet.glow}` }}
          >
            <Image src="/logo.png" alt="SL Muslim History" width={36} height={36} style={{ height: '36px', width: 'auto', display: 'block' }} />
          </div>
          <div>
            <div
              className="text-xs font-black leading-tight"
              style={{
                background: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SL Muslim
            </div>
            <div className="text-xs font-black leading-tight" style={{ color: accents.amber.solid }}>History</div>
            <div className="text-xs mt-0.5" style={{ color: theme.textMuted, fontSize: '10px' }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const a = accents[item.accent]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={{
                    color:      active ? 'white' : theme.textSecondary,
                    background: active ? a.soft : 'transparent',
                    border:     active ? `1px solid ${a.glow}` : '1px solid transparent',
                    boxShadow:  active ? `0 0 20px ${a.glow}` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.color = '#e2e8f0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = theme.textSecondary
                    }
                  }}
                >
                  <span
                    className="text-base w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-lg"
                    style={{ background: active ? a.grad : 'rgba(255,255,255,0.05)' }}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1" style={active ? { color: a.solid } : undefined}>{item.label}</span>
                  {item.label === 'Comments' && pendingComments > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: accents.rose.grad, color: 'white', fontSize: '10px', minWidth: '18px', textAlign: 'center', boxShadow: `0 0 10px ${accents.rose.glow}` }}
                    >
                      {pendingComments}
                    </span>
                  )}
                  {item.label === 'Reactions' && newReactions > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: accents.rose.grad, color: 'white', fontSize: '10px', minWidth: '18px', textAlign: 'center', boxShadow: `0 0 10px ${accents.rose.glow}` }}
                    >
                      {newReactions}
                    </span>
                  )}
                  {item.label === 'Messages' && unreadMsgs > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: accents.rose.grad, color: 'white', fontSize: '10px', minWidth: '18px', textAlign: 'center', boxShadow: `0 0 10px ${accents.rose.glow}` }}
                    >
                      {unreadMsgs}
                    </span>
                  )}
                  {item.label === 'Newsletter' && newSubs > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: accents.amber.grad, color: 'white', fontSize: '10px', minWidth: '18px', textAlign: 'center', boxShadow: `0 0 10px ${accents.amber.glow}` }}
                    >
                      {newSubs}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="mx-4 my-4" style={{ height: '1px', background: theme.divider }} />

          {/* Back to site */}
          <div className="px-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.background = 'transparent' }}
            >
              <span className="text-base w-5 text-center">↗</span>
              View Site
            </Link>
          </div>
        </nav>

        {/* Bottom user info + sign out */}
        <div
          className="px-4 py-4 flex items-center gap-3"
          style={{ borderTop: `1px solid ${theme.divider}` }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: accents.violet.grad, color: 'white', boxShadow: `0 0 14px ${accents.violet.glow}` }}
          >
            {ownerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate" style={{ color: theme.textPrimary }}>{ownerName}</div>
            <div className="text-xs truncate" style={{ color: theme.textMuted }}>Administrator</div>
          </div>
          <button
            onClick={async () => {
              await getAuthClient().auth.signOut()
              router.push('/admin/login')
            }}
            title="Sign out"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: theme.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = accents.rose.solid }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textMuted }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">

        {/* Top bar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
          style={{
            background: 'rgba(10,14,23,0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${theme.divider}`,
            minHeight: '60px',
          }}
        >
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setSidebarOpen(true)}
            style={{ color: theme.textSecondary }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title — derived from pathname */}
          <div className="hidden md:block">
            <h1 className="text-base font-bold" style={{ color: theme.textPrimary }}>
              {navItems.find((n) => isActive(n.href))?.label ?? 'Admin'}
            </h1>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              SL Muslim History · Admin Panel
            </p>
          </div>

          {/* Right actions — context-aware */}
          <div className="flex items-center gap-3 ml-auto">
            {pathname.startsWith('/admin/news') ? (
              <Link
                href="/admin/news/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                style={{ background: accents.blue.grad, boxShadow: `0 2px 16px ${accents.blue.glow}` }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 24px ${accents.blue.glow}` }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 16px ${accents.blue.glow}` }}
              >
                + New Post
              </Link>
            ) : (
              <Link
                href="/admin/articles/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                style={{ background: accents.violet.grad, boxShadow: `0 2px 16px ${accents.violet.glow}` }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 24px ${accents.violet.glow}` }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 16px ${accents.violet.glow}` }}
              >
                + New Article
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
