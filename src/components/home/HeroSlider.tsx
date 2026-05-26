'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { getRecentArticles } from '@/lib/db/articles'
import { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  'Early History':        '#eaf3de',
  'Mosques & Places':     '#e6f1fb',
  'Culture & Traditions': '#faeeda',
  'Notable Figures':      '#fbeaf0',
  'Literature & Arts':    '#f3e8ff',
  'Community & Society':  '#e0f2fe',
}
const CATEGORY_TEXT: Record<string, string> = {
  'Early History':        '#27500a',
  'Mosques & Places':     '#0c447c',
  'Culture & Traditions': '#633806',
  'Notable Figures':      '#72243e',
  'Literature & Arts':    '#5b21b6',
  'Community & Society':  '#0c4a6e',
}
const SLIDE_BG = [
  'linear-gradient(160deg,#0a200a,#1a3d1a)',
  'linear-gradient(160deg,#0a0a20,#1a1a3d)',
  'linear-gradient(160deg,#200a0a,#3d1a1a)',
  'linear-gradient(160deg,#0a1520,#1a304a)',
  'linear-gradient(160deg,#200a20,#3d1a3d)',
]

export default function HeroSlider() {
  const [slides,  setSlides]  = useState<Article[]>([])
  const [cur,     setCur]     = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    getRecentArticles(5).then((articles) => { setSlides(articles); setLoading(false) })
  }, [])

  const go = (n: number) => {
    setCur(n)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 5000)
  }

  useEffect(() => {
    if (slides.length === 0) return
    timerRef.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  const catBg   = (cat: string) => CATEGORY_COLORS[cat] ?? '#f1f5f9'
  const catText = (cat: string) => CATEGORY_TEXT[cat]   ?? '#475569'

  const LabelRow = (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
      <div style={{ background: 'var(--green-dark)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '5px 11px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        Main Story
      </div>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginLeft: '8px' }} />
      <div style={{ display: 'flex', gap: '4px', marginLeft: '7px' }}>
        <button
          onClick={() => go((cur - 1 + slides.length) % slides.length)}
          style={{ width: '26px', height: '26px', borderRadius: '3px', background: 'var(--white)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '15px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-dark)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--green-dark)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          aria-label="Previous slide"
        >‹</button>
        <button
          onClick={() => go((cur + 1) % slides.length)}
          style={{ width: '26px', height: '26px', borderRadius: '3px', background: 'var(--white)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '15px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-dark)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--green-dark)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          aria-label="Next slide"
        >›</button>
      </div>
    </div>
  )

  if (loading) return (
    <div>
      {LabelRow}
      <div style={{ height: '300px', borderRadius: '4px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="animate-shimmer" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )

  return (
    <div>
      {LabelRow}
      <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--green-deeper)' }}>

        {/* Slides */}
        <div style={{ position: 'relative', overflow: 'hidden', height: '300px' }}>
          {slides.map((article, i) => (
            <div
              key={article.id}
              style={{
                position: 'absolute', inset: 0,
                background: SLIDE_BG[i % SLIDE_BG.length],
                opacity: i === cur ? 1 : 0,
                transition: 'opacity .55s ease',
                pointerEvents: i === cur ? 'auto' : 'none',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '24px 22px 20px',
              }}
            >
              {/* Background image — Next.js optimized */}
              {article.featured_image && (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 900px) 100vw, 65vw"
                  style={{ objectFit: 'cover', opacity: 0.55 }}
                />
              )}

              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,14,4,0.88) 0%, rgba(4,14,4,0.45) 45%, rgba(4,14,4,0.08) 100%)' }} />

              {/* Slide content */}
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px' }}>
                <span style={{
                  display: 'inline-block', marginBottom: '8px',
                  fontSize: '10px', fontWeight: 900, letterSpacing: '.09em', textTransform: 'uppercase',
                  padding: '3px 9px', borderRadius: '3px',
                  background: catBg(article.category), color: catText(article.category),
                }}>
                  {article.category}
                </span>
                <h2 style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '17px', fontWeight: 700, color: '#fff', lineHeight: 1.55, marginBottom: '8px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {article.title}
                </h2>
                <div style={{ width: '28px', height: '2px', background: 'var(--gold)', marginBottom: '10px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)', fontWeight: 500 }}>{article.author}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)' }}>·</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>{formatDate(article.published_at)}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)' }}>·</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)' }}>👁 {article.views}</span>
                </div>
                <Link
                  href={`/articles/${article.slug}`}
                  style={{ background: 'var(--gold)', color: '#0f2a0f', fontSize: '11px', fontWeight: 900, padding: '7px 16px', borderRadius: '3px', display: 'inline-block', letterSpacing: '0.04em', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#d4a030' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold)' }}
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar + dots */}
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === cur ? '28px' : '8px',
                  height: '4px', borderRadius: '2px',
                  background: i === cur ? 'var(--gold)' : 'rgba(255,255,255,.28)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all .3s ease',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>
            {cur + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  )
}
