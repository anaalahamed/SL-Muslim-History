'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getAdminConfig } from '@/lib/adminConfig'
import { getUnreadCount } from '@/lib/db/contact'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { getAuthClient } from '@/lib/supabase-auth'
import { AdminPermissions } from '@/lib/permissions'
import { theme, accents } from './adminTheme'

// perm: undefined = always visible (Dashboard); string[] = visible if ANY
// of these permission flags is granted; 'owner' = hidden entirely from
// anyone who isn't the site owner. (Team Access itself lives inside
// Settings -> Account, not as its own sidebar entry.)
const navItems: { label: string; href: string; icon: string; accent: string; perm?: string[] | 'owner' }[] = [
  { label: 'Dashboard',   href: '/admin',              icon: '📊', accent: 'violet' },
  { label: 'Backup',      href: '/admin/backup',        icon: '🗄️', accent: 'blue', perm: ['can_backup'] },
  { label: 'Articles',    href: '/admin/articles',      icon: '📝', accent: 'violet', perm: ['can_articles'] },
  { label: 'News',        href: '/admin/news',          icon: '📰', accent: 'blue', perm: ['can_news_special', 'can_news_janaza'] },
  { label: 'Categories',  href: '/admin/categories',    icon: '🗂️', accent: 'pink', perm: ['can_categories'] },
  { label: 'Authors',     href: '/admin/authors',        icon: '✍️', accent: 'cyan', perm: ['can_authors'] },
  { label: 'Comments',    href: '/admin/comments',      icon: '💬', accent: 'cyan', perm: ['can_comments'] },
  { label: 'Reactions',   href: '/admin/reactions',     icon: '⭐', accent: 'amber', perm: ['can_reactions'] },
  { label: 'Messages',    href: '/admin/messages',      icon: '✉️', accent: 'rose', perm: ['can_messages'] },
  { label: 'Ads',          href: '/admin/ads',            icon: '📢', accent: 'pink', perm: ['can_ads'] },
  { label: 'Newsletter',  href: '/admin/newsletter',    icon: '📬', accent: 'emerald', perm: ['can_newsletter'] },
  { label: 'Settings',    href: '/admin/settings',      icon: '⚙️', accent: 'violet', perm: ['can_settings'] },
]

// Sidebar sits on a dark purple backdrop, so its nav "boxes" use their own
// brighter neon-style glow palette instead of the light-mode accents used
// by the rest of the (white) admin panel.
const navGlow: Record<string, string> = {
  violet: 'rgba(167,139,250,0.55)', blue: 'rgba(96,165,250,0.55)', pink: 'rgba(244,114,182,0.55)',
  cyan: 'rgba(34,211,238,0.55)', amber: 'rgba(251,191,36,0.55)', emerald: 'rgba(52,211,153,0.55)', rose: 'rgba(251,113,133,0.55)',
}
const navSolid: Record<string, string> = {
  violet: '#c4b5fd', blue: '#93c5fd', pink: '#f9a8d4', cyan: '#67e8f9', amber: '#fcd34d', emerald: '#6ee7b7', rose: '#fda4af',
}
const navGrad: Record<string, string> = {
  violet: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', blue: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', pink: 'linear-gradient(135deg,#ec4899,#be185d)',
  cyan: 'linear-gradient(135deg,#06b6d4,#0e7490)', amber: 'linear-gradient(135deg,#f59e0b,#b45309)', emerald: 'linear-gradient(135deg,#10b981,#047857)', rose: 'linear-gradient(135deg,#f43f5e,#be123c)',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [ownerName,     setOwnerName]     = useState('Admin')
  const [unreadMsgs,    setUnreadMsgs]    = useState(0)
  const [newSubs,       setNewSubs]       = useState(0)
  const [pendingComments, setPendingComments] = useState(0)
  const [newReactions,  setNewReactions]  = useState(0)
  // null = owner (no permissions row exists for them, so they see everything)
  const [myPerms, setMyPerms] = useState<AdminPermissions | null>(null)
  const [permsLoaded, setPermsLoaded] = useState(false)

  // A row in admin_permissions means this login is a limited team member,
  // not the owner — RLS only lets each user read their own row, so an
  // empty result here means "no row" (owner) rather than "no access".
  useEffect(() => {
    getAuthClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) { setPermsLoaded(true); return }
      getAuthClient().from('admin_permissions').select('*').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { setMyPerms(data as AdminPermissions | null); setPermsLoaded(true) })
    })
  }, [])

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
  const publicAdminPages = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']
  if (publicAdminPages.includes(pathname)) return <>{children}</>

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  // Owner (no permissions row) sees everything. A limited team member only
  // sees Dashboard plus whatever sections they've been granted — this is
  // just UX (the real gate is the RLS policies), so it's safe to compute
  // client-side.
  const visibleNavItems = navItems.filter((item) => {
    if (!item.perm) return true
    if (!permsLoaded) return true // avoid a flash of missing items while loading
    if (!myPerms) return true // owner (no permissions row) sees everything, including Team
    if (item.perm === 'owner') return false
    return item.perm.some((key) => Boolean((myPerms as unknown as Record<string, boolean>)[key]))
  })

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
          background: 'linear-gradient(180deg, #2e1065 0%, #1a0b3d 55%, #120829 100%)',
          boxShadow: '4px 0 32px rgba(46,16,101,0.4)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div
            className="rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: 'white', padding: '4px', boxShadow: '0 0 20px rgba(167,139,250,0.4)' }}
          >
            <Image src="/logo.png" alt="SL Muslim History" width={36} height={36} style={{ height: '36px', width: 'auto', display: 'block' }} />
          </div>
          <div>
            <div className="text-xs font-black leading-tight text-white">SL Muslim</div>
            <div className="text-xs font-black leading-tight" style={{ color: '#fcd34d' }}>History</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-1.5">
            {visibleNavItems.map((item) => {
              const active = isActive(item.href)
              const glow  = navGlow[item.accent]
              const solid = navSolid[item.accent]
              const grad  = navGrad[item.accent]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={{
                    color:      active ? solid : 'rgba(255,255,255,0.75)',
                    background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                    border:     active ? `1px solid ${glow}` : '1px solid rgba(255,255,255,0.06)',
                    boxShadow:  active ? `0 0 18px ${glow}` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }
                  }}
                >
                  <span
                    className="text-base w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-lg"
                    style={{ background: active ? grad : 'rgba(255,255,255,0.08)' }}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Comments' && pendingComments > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#fde047', color: '#78350f', fontSize: '10px', minWidth: '18px', textAlign: 'center' }}
                    >
                      {pendingComments}
                    </span>
                  )}
                  {item.label === 'Reactions' && newReactions > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#fde047', color: '#78350f', fontSize: '10px', minWidth: '18px', textAlign: 'center' }}
                    >
                      {newReactions}
                    </span>
                  )}
                  {item.label === 'Messages' && unreadMsgs > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#fde047', color: '#78350f', fontSize: '10px', minWidth: '18px', textAlign: 'center' }}
                    >
                      {unreadMsgs}
                    </span>
                  )}
                  {item.label === 'Newsletter' && newSubs > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#fde047', color: '#78350f', fontSize: '10px', minWidth: '18px', textAlign: 'center' }}
                    >
                      {newSubs}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="mx-4 my-4" style={{ height: '1px', background: 'rgba(255,255,255,0.18)' }} />

          {/* Back to site */}
          <div className="px-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.75)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'transparent' }}
            >
              <span className="text-base w-5 text-center">↗</span>
              View Site
            </Link>
          </div>
        </nav>

        {/* Bottom user info + sign out */}
        <div
          className="px-4 py-4 flex items-center gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
          >
            {ownerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate text-white">{ownerName}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>Administrator</div>
          </div>
          <button
            onClick={async () => {
              await getAuthClient().auth.signOut()
              router.push('/admin/login')
            }}
            title="Sign out"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
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
            background: 'rgba(255,255,255,0.85)',
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
              {visibleNavItems.find((n) => isActive(n.href))?.label ?? 'Admin'}
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
