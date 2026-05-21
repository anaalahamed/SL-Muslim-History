'use client'

import Image from 'next/image'
import Link from 'next/link'

const quickLinks = [
  { label: 'Home',       href: '/',          icon: '🏠' },
  { label: 'Articles',   href: '/articles',  icon: '📝' },
  { label: 'News',       href: '/news',      icon: '📰' },
  { label: 'Categories', href: '/category',  icon: '🗂️' },
  { label: 'Contact',    href: '/contact',   icon: '✉️' },
]

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d2e1b 0%, #152d1a 60%, #0a2213 100%)' }}
    >
      {/* Radial glows */}
      <div className="absolute pointer-events-none" style={{ top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(74,158,31,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-80px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Gold top border */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #f0d060 50%, #c9a84c 70%, transparent)' }} />

      <div className="relative z-10 text-center max-w-lg w-full">

        {/* Logo */}
        <div className="inline-block rounded-2xl overflow-hidden mb-10" style={{ background: 'white', padding: '10px 18px' }}>
          <Image src="/logo.png" alt="SL Muslim History" width={130} height={56} className="object-contain" style={{ height: '52px', width: 'auto' }} />
        </div>

        {/* 404 number */}
        <div
          className="font-black leading-none mb-4 select-none"
          style={{
            fontSize: 'clamp(80px, 20vw, 140px)',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(201,168,76,0.4)',
            letterSpacing: '-4px',
          }}
        >
          404
        </div>

        {/* Divider */}
        <div className="w-16 h-0.5 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

        {/* Message */}
        <h1 className="text-2xl font-extrabold text-white mb-3">Page Not Found</h1>
        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.8' }}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          <br />Let&apos;s get you back to the right place.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-10">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(201,168,76,0.15)'
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                e.currentTarget.style.color = '#c9a84c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              }}
            >
              <span className="text-lg">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
        >
          ← Go back
        </button>

      </div>

      {/* Gold bottom border */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #f0d060 50%, #c9a84c 70%, transparent)' }} />
    </div>
  )
}
