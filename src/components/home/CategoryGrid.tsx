'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCategories } from '@/lib/db/categories'
import { Category } from '@/lib/types'

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then((data) => { setCategories(data); setLoading(false) })
  }, [])

  if (loading) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '4px', height: '18px', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-dark)' }}>Categories</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--white)', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="animate-shimmer-light" style={{ width: '26px', height: '26px', borderRadius: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="animate-shimmer-light" style={{ height: '10px', width: '70%', borderRadius: '2px' }} />
                <div className="animate-shimmer-light" style={{ height: '9px', width: '45%', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (categories.length === 0) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '4px', height: '18px', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green-dark)' }}>Categories</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              style={{ background: 'var(--white)', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', transition: 'background .15s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--green-dark)'
                const name = e.currentTarget.querySelector('.cat-name') as HTMLElement
                const count = e.currentTarget.querySelector('.cat-count') as HTMLElement
                if (name) name.style.color = '#fff'
                if (count) count.style.color = 'rgba(255,255,255,.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--white)'
                const name = e.currentTarget.querySelector('.cat-name') as HTMLElement
                const count = e.currentTarget.querySelector('.cat-count') as HTMLElement
                if (name) name.style.color = 'var(--dark)'
                if (count) count.style.color = 'var(--muted)'
              }}
            >
              <div style={{ width: '26px', height: '26px', background: 'var(--green-light)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>
                {cat.icon}
              </div>
              <div>
                <p className="cat-name" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--dark)', transition: 'color .15s', lineHeight: 1.3 }}>{cat.name_en}</p>
                <p className="cat-count" style={{ fontSize: '9px', color: 'var(--muted)', transition: 'color .15s' }}>{cat.article_count} articles</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
