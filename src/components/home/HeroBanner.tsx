'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getArticles, getArticleById } from '@/lib/db/articles'
import { Article } from '@/lib/types'
import { getAdminConfig } from '@/lib/adminConfig'
import { getMediaItemById } from '@/lib/mediaStore'
import { formatDate, formatViews } from '@/lib/utils'

export default function HeroBanner() {
  const [hero,        setHero]        = useState<Article | null>(null)
  const [bannerImage, setBannerImage] = useState('')

  useEffect(() => {
    const cfg = getAdminConfig()
    if (cfg.heroBannerImage) {
      const item = getMediaItemById(cfg.heroBannerImage)
      setBannerImage(item?.dataUrl ?? '')
    }
    const resolveHero = async () => {
      if (cfg.heroArticleId) {
        const pinned = await getArticleById(cfg.heroArticleId)
        if (pinned) { setHero(pinned); return }
      }
      const all = await getArticles()
      setHero(all.find((a) => a.is_featured) ?? all[0] ?? null)
    }
    resolveHero()
  }, [])

  /* ── Skeleton ── */
  if (!hero) return (
    <section style={{ background: 'var(--green-deeper)', minHeight: '420px', position: 'relative', overflow: 'hidden' }}>
      <div className="animate-shimmer absolute inset-0" />
      <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 48px', minHeight: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '580px' }}>
          <div className="animate-shimmer-light" style={{ height: '22px', width: '120px', borderRadius: '3px', marginBottom: '16px', opacity: 0.35 }} />
          <div className="animate-shimmer-light" style={{ height: '36px', width: '80%', borderRadius: '3px', marginBottom: '10px', opacity: 0.3 }} />
          <div className="animate-shimmer-light" style={{ height: '36px', width: '60%', borderRadius: '3px', marginBottom: '20px', opacity: 0.22 }} />
          <div className="animate-shimmer-light" style={{ height: '16px', width: '100%', borderRadius: '3px', marginBottom: '8px', opacity: 0.18 }} />
          <div className="animate-shimmer-light" style={{ height: '16px', width: '75%', borderRadius: '3px', marginBottom: '28px', opacity: 0.14 }} />
          <div className="animate-shimmer-light" style={{ height: '42px', width: '160px', borderRadius: '3px', opacity: 0.28 }} />
        </div>
      </div>
    </section>
  )

  const image = bannerImage || hero.featured_image

  return (
    <section className="relative w-full overflow-hidden page-enter" style={{ minHeight: '420px' }}>

      {/* Background */}
      {image ? (
        <img
          src={image}
          alt={hero.title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--green-deeper) 0%, var(--green-dark) 60%, var(--green-deeper) 100%)' }} />
      )}

      {/* Overlays for readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: image
          ? 'linear-gradient(to right, rgba(10,30,10,0.93) 0%, rgba(10,30,10,0.78) 55%, rgba(10,30,10,0.28) 100%)'
          : 'linear-gradient(135deg, rgba(5,15,5,0.5) 0%, transparent 100%)',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,30,10,0.88) 0%, transparent 55%)' }} />

      {/* Gold top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, var(--gold), rgba(184,137,42,0.3) 70%, transparent)' }} />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 24px 48px',
          minHeight: '420px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ maxWidth: '640px' }}>

          {/* Badges */}
          <div className="animate-fadeInUp flex items-center gap-3 mb-4" style={{ animationDelay: '0.1s' }}>
            <span
              className="font-black text-xs uppercase"
              style={{
                background: 'var(--gold)',
                color: '#0f2a0f',
                padding: '4px 12px',
                borderRadius: '2px',
                letterSpacing: '0.1em',
              }}
            >
              ✦ Featured
            </span>
            <span
              className="text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.85)',
                padding: '4px 12px',
                borderRadius: '2px',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(6px)',
              }}
            >
              {hero.category}
            </span>
          </div>

          {/* Title */}
          <h1
            className="animate-fadeInUp tamil-heading font-bold text-white mb-3"
            style={{
              fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
              lineHeight: '1.3',
              textShadow: '0 2px 16px rgba(0,0,0,0.45)',
              animationDelay: '0.18s',
            }}
          >
            {hero.title}
          </h1>

          {/* Gold rule */}
          <div className="animate-fadeInUp" style={{ width: '40px', height: '2px', background: 'var(--gold)', marginBottom: '14px', animationDelay: '0.22s' }} />

          {/* Excerpt */}
          <p
            className="animate-fadeInUp tamil-text mb-6 line-clamp-3"
            style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.75)',
              maxWidth: '540px',
              animationDelay: '0.28s',
            }}
          >
            {hero.excerpt}
          </p>

          {/* Bottom row */}
          <div className="animate-fadeInUp flex flex-wrap items-center gap-4" style={{ animationDelay: '0.36s' }}>
            <Link
              href={`/articles/${hero.slug}`}
              className="inline-flex items-center gap-2 font-bold text-sm transition-all"
              style={{
                background: 'var(--gold)',
                color: '#0f2a0f',
                padding: '11px 26px',
                borderRadius: '3px',
                letterSpacing: '0.03em',
                boxShadow: '0 4px 20px rgba(184,137,42,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(184,137,42,0.55)'
                e.currentTarget.style.background = '#cfa040'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(184,137,42,0.4)'
                e.currentTarget.style.background = 'var(--gold)'
              }}
            >
              Read Full Article →
            </Link>

            <div className="hidden sm:block w-px h-7" style={{ background: 'rgba(255,255,255,0.18)' }} />

            {/* Author */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--gold) 0%, #8a6010 100%)' }}
              >
                {hero.author.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>{hero.author}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.48)' }}>{formatDate(hero.published_at)}</p>
              </div>
            </div>

            {/* Views */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px',
              }}
            >
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>👁</span>
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.72)' }}>{formatViews(hero.views)} views</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gold accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, var(--gold), rgba(184,137,42,0.4) 60%, transparent)' }} />
    </section>
  )
}
