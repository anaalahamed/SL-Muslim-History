'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { GalleryImage } from '@/lib/types'

interface Props {
  images: GalleryImage[]
}

export default function GalleryLightbox({ images }: Props) {
  const [current,  setCurrent]  = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const sorted = [...images].sort((a, b) => a.order - b.order)

  const prev = useCallback(() => setCurrent(c => (c - 1 + sorted.length) % sorted.length), [sorted.length])
  const next = useCallback(() => setCurrent(c => (c + 1) % sorted.length), [sorted.length])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightbox, prev, next])

  if (sorted.length === 0) return null

  const img = sorted[current]

  /* ── Lightbox (portal — escapes overflow:hidden & CSS transforms) ── */
  const lightboxPortal = mounted && lightbox ? createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => setLightbox(false)}
    >
      {/* Close */}
      <button
        onClick={() => setLightbox(false)}
        style={{ position: 'absolute', top: '16px', right: '18px', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Close"
      >×</button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>
        {current + 1} / {sorted.length}
      </div>

      {/* Prev */}
      {sorted.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          aria-label="Previous photo"
        >‹</button>
      )}

      {/* Image container */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '78vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}
      >
        <img
          src={img.url}
          alt={img.caption || `Photo ${current + 1}`}
          style={{ maxWidth: '90vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px', display: 'block', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
        />
        {img.caption && (
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '14px', textAlign: 'center', maxWidth: '580px', lineHeight: '1.6', padding: '0 16px' }}>
            {img.caption}
          </p>
        )}
      </div>

      {/* Next */}
      {sorted.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          aria-label="Next photo"
        >›</button>
      )}

      {/* Thumbnail strip */}
      {sorted.length > 1 && (
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', maxWidth: '90vw', overflowX: 'auto', padding: '4px' }}>
          {sorted.map((t, i) => (
            <div
              key={t.id}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
              style={{ width: '54px', height: '40px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: `2px solid ${i === current ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}`, opacity: i === current ? 1 : 0.6, transition: 'all 0.2s' }}
            >
              <img src={t.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>,
    document.body
  ) : null

  return (
    <>
      {/* ── Carousel ── */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#0f172a', position: 'relative' }}>

        {/* Main image */}
        <div
          style={{ position: 'relative', width: '100%', aspectRatio: '16/9', cursor: 'zoom-in' }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={img.url}
            alt={img.caption || `Photo ${current + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
          {/* Fullscreen hint */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 600, padding: '4px 9px', borderRadius: '4px', pointerEvents: 'none', letterSpacing: '0.03em' }}>
            ⛶ Fullscreen
          </div>
          {/* Caption gradient */}
          {img.caption && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.78))', padding: '32px 16px 14px', color: 'rgba(255,255,255,0.92)', fontSize: '13px', lineHeight: 1.5, pointerEvents: 'none' }}>
              {img.caption}
            </div>
          )}
        </div>

        {/* Left arrow */}
        {sorted.length > 1 && (
          <button
            onClick={prev}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(0,0,0,0.58)', border: '1.5px solid rgba(255,255,255,0.22)', color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, transition: 'background 0.18s', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.85)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.58)'}
            aria-label="Previous photo"
          >‹</button>
        )}

        {/* Right arrow */}
        {sorted.length > 1 && (
          <button
            onClick={next}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(0,0,0,0.58)', border: '1.5px solid rgba(255,255,255,0.22)', color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, transition: 'background 0.18s', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.85)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.58)'}
            aria-label="Next photo"
          >›</button>
        )}

        {/* Counter pill */}
        {sorted.length > 1 && (
          <div style={{ position: 'absolute', bottom: img.caption ? '42px' : '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 700, padding: '3px 11px', borderRadius: '20px', pointerEvents: 'none' }}>
            {current + 1} / {sorted.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {sorted.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {sorted.map((t, i) => (
            <div
              key={t.id}
              onClick={() => setCurrent(i)}
              style={{ width: '64px', height: '48px', flexShrink: 0, borderRadius: '5px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === current ? 'var(--gold)' : 'rgba(0,0,0,0.1)'}`, opacity: i === current ? 1 : 0.5, transition: 'all 0.15s', background: '#e2e8f0' }}
            >
              <img src={t.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {lightboxPortal}
    </>
  )
}
