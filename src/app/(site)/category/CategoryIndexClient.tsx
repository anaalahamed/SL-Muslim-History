'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCategories } from '@/lib/db/categories'
import { getArticles } from '@/lib/db/articles'
import { Category } from '@/lib/types'
import AnimateIn from '@/components/ui/AnimateIn'
import PageHero from '@/components/ui/PageHero'
import { getAdminConfig, defaultConfig } from '@/lib/adminConfig'

const categoryDescriptions: Record<string, string> = {
  'early-history':       'Explore the origins of Islam in Sri Lanka, from the first Arab traders to the establishment of Muslim communities across the island.',
  'mosques-places':      'Discover the historic mosques, shrines, and sacred sites that have shaped the spiritual landscape of Sri Lanka\'s Muslim community.',
  'culture-traditions':  'Delve into the rich cultural traditions, festivals, cuisine, and customs that define Sri Lanka\'s unique Muslim heritage.',
  'notable-figures':     'Learn about the remarkable leaders, scholars, poets, and pioneers who shaped the history of Sri Lanka\'s Muslim community.',
  'literature-arts':     'Explore the literary works, poetry, calligraphy, and artistic expressions of Sri Lanka\'s Muslim scholars and artists.',
  'community-society':   'Understand the social structures, education, politics, and community life of Muslims in Sri Lanka through the centuries.',
}

const categoryGradients: Record<string, string> = {
  'early-history':       'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
  'mosques-places':      'linear-gradient(135deg, #15803d 0%, #166534 100%)',
  'culture-traditions':  'linear-gradient(135deg, #a16207 0%, #92400e 100%)',
  'notable-figures':     'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  'literature-arts':     'linear-gradient(135deg, #c2410c 0%, #b45309 100%)',
  'community-society':   'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
}

export default function CategoryIndexClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [totalArticles, setTotalArticles] = useState(0)
  const [stats, setStats] = useState(defaultConfig.stats)

  useEffect(() => {
    getCategories().then(setCategories)
    getArticles().then((a) => setTotalArticles(a.length))
    setStats(getAdminConfig().stats)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <PageHero
        badge="Categories"
        title="Browse by Topic"
        subtitle={`${categories.length} categories · ${totalArticles} articles covering 1,400 years of Sri Lanka Muslim history`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <AnimateIn key={cat.id} direction="up" delay={i * 100}>
              <Link
                href={`/category/${cat.slug}`}
                className="group block rounded-2xl overflow-hidden"
                style={{
                  border: '1px solid var(--border)',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                }}
              >
                <div
                  className="h-32 flex items-center justify-center relative overflow-hidden"
                  style={{ background: categoryGradients[cat.slug] ?? 'var(--green)' }}
                >
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
                  <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.5)' }} />
                  <span className="text-6xl relative z-10 drop-shadow">{cat.icon}</span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-extrabold text-lg" style={{ color: 'var(--dark)' }}>{cat.name_en}</h2>
                    <span className="flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-full ml-2" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                      {cat.article_count}
                    </span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
                    {categoryDescriptions[cat.slug] ?? ''}
                  </p>
                  <div className="flex items-center gap-1 text-sm font-bold transition-all" style={{ color: 'var(--green)' }}>
                    Explore articles
                    <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>

        {/* Stats strip */}
        <AnimateIn direction="up" delay={200} className="mt-12">
          <div className="rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
            {stats.map((stat) => (
              <div key={stat.id}>
                <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{stat.icon}</div>
                <div className="text-2xl font-black mb-1" style={{ color: 'var(--green)' }}>{stat.value}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </div>
  )
}
