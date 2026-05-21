'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getAdminConfig } from '@/lib/adminConfig'
import { getUnreadCount } from '@/lib/db/contact'
import { supabase } from '@/lib/supabase'

const navItems = [
  { label: 'Dashboard',   href: '/admin',              icon: '📊' },
  { label: 'Articles',    href: '/admin/articles',      icon: '📝' },
  { label: 'News',        href: '/admin/news',          icon: '📰' },
  { label: 'Categories',  href: '/admin/categories',    icon: '🗂️' },
  { label: 'Authors',     href: '/admin/authors',        icon: '✍️' },
  { label: 'Messages',    href: '/admin/messages',      icon: '✉️' },
  { label: 'Homepage',    href: '/admin/homepage',      icon: '🏠' },
  { label: 'Ads',          href: '/admin/ads',            icon: '📢' },
  { label: 'Newsletter',  href: '/admin/newsletter',    icon: '📬' },
  { label: 'Settings',    href: '/admin/settings',      icon: '⚙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [ownerName,     setOwnerName]     = useState('Admin')
  const [unreadMsgs,    setUnreadMsgs]    = useState(0)
  const [newSubs,       setNewSubs]       = useState(0)

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (pathname === '/admin/login') return
    const auth = sessionStorage.getItem('slmh_admin_auth')
    if (!auth) router.replace('/admin/login')
  }, [pathname, router])

  // Load owner name from config (fall back to login username if display name not set)
  useEffect(() => {
    const config = getAdminConfig()
    const loginUsername = localStorage.getItem('slmh_admin_username') ?? 'admin'
    setOwnerName(config.ownerName || loginUsername)
  }, [pathname]) // re-read on every nav so Settings changes reflect immediately

  // Poll unread message count
  useEffect(() => {
    setUnreadMsgs(getUnreadCount())
    const interval = setInterval(() => setUnreadMsgs(getUnreadCount()), 5000)
    return () => clearInterval(interval)
  }, [pathname])

  // Poll new newsletter subscribers since last viewed
  useEffect(() => {
    async function checkNewSubs() {
      if (!supabase) return
      const lastViewed = localStorage.getItem('slmh_newsletter_last_viewed')
      if (!lastViewed) {
        const { count } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
        setNewSubs(count ?? 0)
        return
      }
      const { count } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .gt('subscribed_at', lastViewed)
      setNewSubs(count ?? 0)
    }
    checkNewSubs()
    const interval = setInterval(checkNewSubs, 30000)
    return () => clearInterval(interval)
  }, [pathname])

  // Don't render layout on login page
  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 md:translate-x-0"
        style={{
          width: '240px',
          background: 'linear-gradient(180deg, #1a3a0f 0%, #0d2208 100%)',
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'white', padding: '4px' }}>
            <Image src="/logo.png" alt="SL Muslim History" width={36} height={36} style={{ height: '36px', width: 'auto', display: 'block' }} />
          </div>
          <div>
            <div className="text-xs font-black text-white leading-tight">SL Muslim</div>
            <div className="text-xs font-black leading-tight" style={{ color: 'var(--gold, #c9a84c)' }}>History</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={{
                    color:      active ? 'white'                    : 'rgba(255,255,255,0.55)',
                    background: active ? 'rgba(74,158,31,0.35)'     : 'transparent',
                    borderLeft: active ? '3px solid #4a9e1f'        : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                    }
                  }}
                >
                  <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Messages' && unreadMsgs > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#dc2626', color: 'white', fontSize: '10px', minWidth: '18px', textAlign: 'center' }}
                    >
                      {unreadMsgs}
                    </span>
                  )}
                  {item.label === 'Newsletter' && newSubs > 0 && (
                    <span
                      className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#c2410c', color: 'white', fontSize: '10px', minWidth: '18px', textAlign: 'center' }}
                    >
                      {newSubs}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="mx-4 my-4" style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />

          {/* Back to site */}
          <div className="px-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
            >
              <span className="text-base w-5 text-center">↗</span>
              View Site
            </Link>
          </div>
        </nav>

        {/* Bottom user info + sign out */}
        <div
          className="px-4 py-4 flex items-center gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: '#4a9e1f', color: 'white' }}
          >
            {ownerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{ownerName}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>Administrator</div>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('slmh_admin_auth'); router.push('/admin/login') }}
            title="Sign out"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,0,0,0.2)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: '240px' }}>

        {/* Top bar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
          style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            minHeight: '60px',
          }}
        >
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setSidebarOpen(true)}
            style={{ color: '#64748b' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title — derived from pathname */}
          <div className="hidden md:block">
            <h1 className="text-base font-bold" style={{ color: '#0f172a' }}>
              {navItems.find((n) => isActive(n.href))?.label ?? 'Admin'}
            </h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              SL Muslim History · Admin Panel
            </p>
          </div>

          {/* Right actions — context-aware */}
          <div className="flex items-center gap-3 ml-auto">
            {pathname.startsWith('/admin/news') ? (
              <Link
                href="/admin/news/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(74,158,31,0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(74,158,31,0.3)' }}
              >
                + New Post
              </Link>
            ) : (
              <Link
                href="/admin/articles/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(74,158,31,0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(74,158,31,0.3)' }}
              >
                + New Article
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
