'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { getArticles } from '@/lib/db/articles'
import { Article } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  'Early History':        '#eaf3de',
  'Mosques & Places':     '#e6f1fb',
  'Culture & Traditions': '#faeeda',
  'Notable Figures':      '#fbeaf0',
  'Literature & Arts':    '#f3e8ff',
  'Community & Society':  '#e0f2fe',
  'World News':           '#faeeda',
  'Local News':           '#fbeaf0',
  'News':                 '#e6f1fb',
}
const CATEGORY_TEXT: Record<string, string> = {
  'Early History':        '#27500a',
  'Mosques & Places':     '#0c447c',
  'Culture & Traditions': '#633806',
  'Notable Figures':      '#72243e',
  'Literature & Arts':    '#5b21b6',
  'Community & Society':  '#0c4a6e',
  'World News':           '#633806',
  'Local News':           '#72243e',
  'News':                 '#0c447c',
}
const SLIDE_BG = [
  'linear-gradient(160deg,#0a200a,#1a3d1a)',
  'linear-gradient(160deg,#0a0a20,#1a1a3d)',
  'linear-gradient(160deg,#200a0a,#3d1a1a)',
  'linear-gradient(160deg,#0a1520,#1a304a)',
  'linear-gradient(160deg,#200a20,#3d1a3d)',
]

export default function HeroSlider() {
  const [slides, setSlides]   = useState<Article[]>([])
  const [cur,    setCur]      = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    getArticles().then((all) => {
      setSlides(all.slice(0, 5))
      setLoading(false)
    })
  }, [])

  const go = (n: number) => {
    setCur(n)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 4500)
  }

  useEffect(() => {
    if (slides.length === 0) return
    timerRef.current = setInterval(() => setCur((c) => (c + 1) % slides.length), 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  const catBg   = (cat: string) => CATEGORY_COLORS[cat] ?? '#f1f5f9'
  const catText = (cat: string) => CATEGORY_TEXT[cat]   ?? '#475569'

  /* Label row with prev/next */
  const LabelRow = (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
      <div style={{ background: 'var(--green-dark)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '5px 11px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        Main Story
      </div>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginLeft: '8px' }} />
      <div style={{ display: 'flex', gap: '4px', marginLeft: '7px' }}>
        <button
          onClick={() => go((cur - 1 + slides.length) % slides.length)}
          style={{ width: '22px', height: '22px', borderRadius: '2px', background: 'var(--white)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Previous slide"
        >‹</button>
        <button
          onClick={() => go((cur + 1) % slides.length)}
          style={{ width: '22px', height: '22px', borderRadius: '2px', background: 'var(--white)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Next slide"
        >›</button>
      </div>
    </div>
  )

  if (loading) return (
    <div>
      {LabelRow}
      <div style={{ height: '240px', borderRadius: '3px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="animate-shimmer" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )

  return (
    <div>
      {LabelRow}
      <div style={{ borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--green-deeper)' }}>
        {/* Slides */}
        <div style={{ position: 'relative', overflow: 'hidden', height: '210px' }}>
          {slides.map((article, i) => (
            <div
              key={article.id}
              style={{
                position: 'absolute', inset: 0,
                background: SLIDE_BG[i % SLIDE_BG.length],
                opacity: i === cur ? 1 : 0,
                transition: 'opacity .5s ease',
                pointerEvents: i === cur ? 'auto' : 'none',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '18px 16px 14px',
              }}
            >
              {/* Background image */}
              {article.featured_image && (
                <img
                  src={article.featured_image}
                  alt={article.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
                />
              )}
              {/* Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(5,18,5,.96) 0%,rgba(5,18,5,.3) 100%)' }} />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '500px' }}>
                <span style={{
                  display: 'inline-block', marginBottom: '6px',
                  fontSize: '9px', fontWeight: 900, letterSpacing: '.09em', textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: '2px',
                  background: catBg(article.category), color: catText(article.category),
                }}>
                  {article.category}
                </span>
                <h2 style={{ fontFamily: "'Noto Sans Tamil','Lato',sans-serif", fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.5, marginBottom: '6px' }}>
                  {article.title}
                </h2>
                <div style={{ width: '24px', height: '2px', background: 'var(--gold)', marginBottom: '7px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '9px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.55)' }}>{article.author}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)' }}>{formatDate(article.published_at)}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)' }}>👁 {article.views}</span>
                </div>
                <Link
                  href={`/articles/${article.slug}`}
                  style={{ background: 'var(--gold)', color: '#0f2a0f', fontSize: '10px', fontWeight: 900, padding: '5px 13px', borderRadius: '3px', display: 'inline-block' }}
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '6px 0', background: 'rgba(0,0,0,.45)' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === cur ? '30px' : '18px', height: '3px', borderRadius: '2px',
                background: i === cur ? 'var(--gold)' : 'rgba(255,255,255,.28)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all .3s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
