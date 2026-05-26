'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import IslamicDate from '@/components/ui/IslamicDate'

const navLinks = [
  { label: 'Home',       href: '/' },
  { label: 'Articles',   href: '/articles' },
  { label: 'News',       href: '/news' },
  { label: 'Categories', href: '/category' },
  { label: 'About',      href: '/about' },
  { label: 'Contact',    href: '/contact' },
]

const categoryDropdown = [
  { label: '📜 Early History',        href: '/category/early-history' },
  { label: '🕌 Mosques & Places',     href: '/category/mosques-places' },
  { label: '🎨 Culture & Traditions', href: '/category/culture-traditions' },
  { label: '👑 Notable Figures',      href: '/category/notable-figures' },
  { label: '📖 Literature & Arts',    href: '/category/literature-arts' },
  { label: '🤝 Community & Society',  href: '/category/community-society' },
]

export default function Header() {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const [catOpen,    setCatOpen]    = useState(false)
  const [searchVal,  setSearchVal]  = useState('')
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const close = () => setCatOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ── Utility bar ── */}
      <div
        className="text-white text-xs py-1.5 px-4 flex items-center justify-between gap-4"
        style={{ background: 'var(--green-deeper)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <IslamicDate />
        <span
          className="hidden sm:block tracking-widest text-center flex-1 text-xs font-bold uppercase"
          style={{ color: 'var(--gold)', letterSpacing: '0.13em', opacity: 0.9 }}
        >
          ✦ Preserving 1,400 years of Sri Lanka&apos;s Muslim Heritage ✦
        </span>
        <div className="hidden sm:flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/about"   className="hover:text-white transition-colors">About</Link>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>

      {/* ── Masthead ── */}
      <div
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo + site name */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Image
            src="/logo.png"
            alt="SL Muslim History"
            width={52}
            height={52}
            className="object-contain"
            style={{ height: '52px', width: 'auto' }}
            priority
          />
          <div>
            <h1
              className="serif-heading"
              style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-dark)', lineHeight: 1, letterSpacing: '-0.3px' }}
            >
              இலங்கை முஸ்லிம்களின் வரலாறு
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: '3px', fontWeight: 700 }}>
              Sri Lanka Muslim History
            </p>
          </div>
        </Link>

        {/* Right: search + donate + mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Donate — desktop */}
          <Link
            href="/donate"
            className="hidden md:inline-flex items-center gap-1.5 font-bold text-xs transition-all"
            style={{
              background: 'var(--gold)',
              color: 'white',
              padding: '8px 18px',
              borderRadius: '3px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-dark)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gold)' }}
          >
            ♥ Donate
          </Link>

          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            style={{
              padding: '8px 10px',
              borderRadius: '3px',
              border: '1px solid var(--border)',
              background: searchOpen ? 'var(--green-light)' : 'transparent',
              color: searchOpen ? 'var(--green-dark)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            aria-label="Search"
          >
            {searchOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            style={{
              padding: '8px 10px',
              borderRadius: '3px',
              border: '1px solid var(--border)',
              background: menuOpen ? 'var(--green-light)' : 'transparent',
              color: menuOpen ? 'var(--green-dark)' : 'var(--text)',
              cursor: 'pointer',
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav
        style={{
          background: scrolled ? 'rgba(26,61,26,0.98)' : 'var(--green-dark)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '3px solid var(--gold)',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="hidden md:flex items-center h-12">
            {navLinks.map((link) => {
              const active = isActive(link.href)

              if (link.label === 'Categories') {
                return (
                  <div
                    key={link.href}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                  >
                    <Link
                      href="/category"
                      className="relative flex items-center gap-1 px-4 h-full text-xs font-bold uppercase tracking-wider transition-colors duration-150"
                      style={{ color: active || catOpen ? 'var(--gold)' : 'rgba(255,255,255,0.82)', letterSpacing: '0.09em' }}
                    >
                      Categories
                      <svg
                        className="w-3 h-3 transition-transform duration-200"
                        style={{ transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)', marginTop: '1px' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                      {(active || catOpen) && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--gold)' }} />
                      )}
                    </Link>

                    {catOpen && (
                      <div className="absolute top-full left-0 pt-0 w-56" style={{ zIndex: 100 }}>
                        <div
                          style={{
                            background: 'var(--white)',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.14)',
                            border: '1px solid var(--border)',
                            borderTop: '2px solid var(--gold)',
                            borderRadius: '0 0 4px 4px',
                            animation: 'fadeInDown 0.15s ease',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                          }}
                        >
                          {categoryDropdown.map((cat) => (
                            <Link
                              key={cat.href}
                              href={cat.href}
                              onClick={() => setCatOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all"
                              style={{ color: 'var(--text)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--green-pale)'
                                e.currentTarget.style.color = 'var(--green-dark)'
                                e.currentTarget.style.paddingLeft = '20px'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = 'var(--text)'
                                e.currentTarget.style.paddingLeft = '16px'
                              }}
                            >
                              {cat.label}
                            </Link>
                          ))}
                          <div style={{ borderTop: '1px solid var(--border)', margin: '4px 12px' }} />
                          <Link
                            href="/category"
                            onClick={() => setCatOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all"
                            style={{ color: 'var(--green)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-pale)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                          >
                            View all categories →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center px-4 h-full text-xs font-bold uppercase tracking-wider transition-colors duration-150"
                  style={{ color: active ? 'var(--gold)' : 'rgba(255,255,255,0.82)', letterSpacing: '0.09em' }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--gold)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.82)' }}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--gold)' }} />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── Search bar ── */}
        <div style={{ maxHeight: searchOpen ? '64px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = searchVal.trim()
                if (!q) return
                setSearchOpen(false)
                setSearchVal('')
                router.push(`/search?q=${encodeURIComponent(q)}`)
              }}
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '3px',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search articles, news, history..."
                autoFocus={searchOpen}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ fontFamily: "'Noto Sans Tamil', 'Lato', sans-serif", color: 'rgba(255,255,255,0.9)' }}
              />
              {searchVal && (
                <button type="button" onClick={() => setSearchVal('')} style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <kbd className="text-xs px-2 py-0.5 rounded hidden sm:block" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>ESC</kbd>
            </form>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div style={{ maxHeight: menuOpen ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
          <div className="md:hidden px-4 py-2 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'var(--green-deeper)' }}>
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
                  style={{
                    color: active ? 'var(--gold)' : 'rgba(255,255,255,0.75)',
                    background: active ? 'rgba(184,137,42,0.12)' : 'transparent',
                    borderLeft: `3px solid ${active ? 'var(--gold)' : 'transparent'}`,
                    letterSpacing: '0.09em',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/donate"
              className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase mt-1"
              style={{ background: 'var(--gold)', color: 'white', borderRadius: '3px', letterSpacing: '0.09em' }}
              onClick={() => setMenuOpen(false)}
            >
              ♥ Donate
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
