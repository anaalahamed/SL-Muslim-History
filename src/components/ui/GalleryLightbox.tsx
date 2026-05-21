'use client'

import { useState, useEffect, useCallback } from 'react'
import { GalleryImage } from '@/lib/types'

interface Props {
  images: GalleryImage[]
}

export default function GalleryLightbox({ images }: Props) {
  const [open,    setOpen]    = useState(false)
  const [current, setCurrent] = useState(0)

  const sorted = [...images].sort((a, b) => a.order - b.order)

  const prev = useCallback(() => setCurrent((c) => (c - 1 + sorted.length) % sorted.length), [sorted.length])
  const next = useCallback(() => setCurrent((c) => (c + 1) % sorted.length), [sorted.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, prev, next])

  if (sorted.length === 0) return null

  return (
    <div>
      {/* Gallery grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '24px' }}>
        {sorted.map((img, i) => (
          <div
            key={img.id}
            onClick={() => { setCurrent(i); setOpen(true) }}
            style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: 'var(--green-light)', transition: 'transform .2s, box-shadow .2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.15)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <img src={img.url} alt={img.caption || `Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {img.caption && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: '10px', padding: '4px 7px', lineHeight: 1.4 }}>
                {img.caption}
              </div>
            )}
            {/* Number badge */}
            <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '2px' }}>
              {i + 1}
            </div>
            {/* Expand icon */}
            <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: '11px', padding: '3px 6px', borderRadius: '2px' }}>
              ⛶
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', top: '16px', right: '20px', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', fontSize: '22px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >×</button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.7)', fontSize: '13px', fontWeight: 700 }}>
            {current + 1} / {sorted.length}
          </div>

          {/* Prev */}
          {sorted.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', fontSize: '24px', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >‹</button>
          )}

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <img
              src={sorted[current].url}
              alt={sorted[current].caption || `Photo ${current + 1}`}
              style={{ maxWidth: '90vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: '4px' }}
            />
            {sorted[current].caption && (
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '13px', textAlign: 'center', maxWidth: '500px' }}>
                {sorted[current].caption}
              </p>
            )}
          </div>

          {/* Next */}
          {sorted.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', fontSize: '24px', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >›</button>
          )}

          {/* Thumbnail strip */}
          {sorted.length > 1 && (
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', maxWidth: '90vw', overflowX: 'auto', padding: '4px' }}>
              {sorted.map((img, i) => (
                <div
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                  style={{ width: '48px', height: '36px', borderRadius: '3px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: `2px solid ${i === current ? 'var(--gold)' : 'rgba(255,255,255,.2)'}`, transition: 'border-color .2s' }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
