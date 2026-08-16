'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getAllAds, deleteAd, toggleAdActive } from '@/lib/db/ads'
import { getSiteSettings, updateSiteSettings } from '@/lib/db/siteSettings'
import { Advertisement } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { getAuthClient } from '@/lib/supabase-auth'

type AdSource = 'google' | 'manual'

export default function AdminAdsPage() {
  const [ads,        setAds]      = useState<Advertisement[]>([])
  const [deleteId,   setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [betweenNewsSource,    setBetweenNewsSource]    = useState<AdSource>('google')
  const [homepageBottomSource, setHomepageBottomSource] = useState<AdSource>('google')
  const [sourceLoaded, setSourceLoaded] = useState(false)

  useEffect(() => { getAllAds(getAuthClient()).then(setAds) }, [])

  useEffect(() => {
    getSiteSettings().then((s) => {
      setBetweenNewsSource(s?.adSlotSource?.betweenNews === 'manual' ? 'manual' : 'google')
      setHomepageBottomSource(s?.adSlotSource?.homepageBottom === 'manual' ? 'manual' : 'google')
      setSourceLoaded(true)
    })
  }, [])

  async function handleSourceChange(slot: 'betweenNews' | 'homepageBottom', value: AdSource) {
    if (slot === 'betweenNews') setBetweenNewsSource(value)
    else setHomepageBottomSource(value)
    const current = (await getSiteSettings()) ?? {}
    await updateSiteSettings({
      adSlotSource: { ...current.adSlotSource, [slot]: value },
    }, getAuthClient())
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleAdActive(id, !current, getAuthClient())
    setAds((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !current } : a))
  }

  async function doDelete() {
    if (!deleteId) return
    const err = await deleteAd(deleteId, getAuthClient())
    if (err) { setDeleteError(err); return }
    setAds((prev) => prev.filter((a) => a.id !== deleteId))
    setDeleteId(null)
    setDeleteError(null)
  }

  const betweenNews = ads.filter((a) => a.position === 'between-news')
  const sidebar     = ads.filter((a) => a.position === 'sidebar')
  const banner      = ads.filter((a) => a.position === 'banner')
  const leftPanel   = ads.filter((a) => a.position === 'left-panel')
  const rightPanel  = ads.filter((a) => a.position === 'right-panel')
  const homepageBottom = ads.filter((a) => a.position === 'homepage-bottom')

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Advertisements</h2>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{ads.length} total · {ads.filter((a) => a.is_active).length} active</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
          style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}
        >
          + New Ad
        </Link>
      </div>

      {/* Info box: numbered list + homepage blueprint, side by side */}
      <div className="rounded-2xl p-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <p className="font-bold mb-3 text-sm" style={{ color: '#166534' }}>Six ad positions available:</p>
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Numbered list */}
          <ol className="text-xs space-y-2.5 flex-1" style={{ color: '#15803d' }}>
            {[
              { n: 1, label: 'Between News', desc: '500×200 recommended (5:2 shape). Homepage, between Special News and Latest News. Also shown on article pages, below "Share This Article".' },
              { n: 2, label: 'General Sidebar', desc: '300×250. On article, news, category, and search page sidebars.' },
              { n: 3, label: 'Full Banner', desc: '728×90. On listing pages (articles, news, search) — not on the homepage.' },
              { n: 4, label: 'Left Side Panel', desc: '160px wide. Desktop screens ≥ 1620px, every page.' },
              { n: 5, label: 'Right Side Panel', desc: '160px wide. Desktop screens ≥ 1620px, every page.' },
              { n: 6, label: 'Homepage — Below Articles', desc: '728×90. Bottom of the homepage article list. Also shown on article pages, below the reactions.' },
            ].map(({ n, label, desc }) => (
              <li key={n} className="flex gap-2">
                <NumberBadge n={n} />
                <span><strong>{label}</strong> — {desc}</span>
              </li>
            ))}
          </ol>

          {/* Homepage blueprint */}
          <div className="flex-shrink-0" style={{ width: '100%', maxWidth: '280px' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#166534' }}>Where these appear on your homepage:</p>
            <div style={{ border: '2px solid #86efac', borderRadius: 10, padding: 6, background: 'white', display: 'flex', gap: 4 }}>
              <NumberBadge n={4} tall />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <PlaceholderBox label="Header" />
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <PlaceholderBox label="Hero / Featured" />
                    <PlaceholderBox label="Article List" tall />
                    <NumberBadge n={6} wide />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <PlaceholderBox label="Special News" />
                    <NumberBadge n={1} wide />
                    <PlaceholderBox label="More sections" tall />
                  </div>
                </div>
              </div>
              <NumberBadge n={5} tall />
            </div>
            <p className="text-xs mt-2" style={{ color: '#4d7c0f' }}>
              #2 and #3 aren&apos;t on the homepage — they appear on article and listing pages instead.
            </p>
          </div>

        </div>
      </div>

      {/* Between-news: Google AdSense vs your own picture */}
      {sourceLoaded && (
        <AdSourceCard
          title="Between News (Ad #1)"
          value={betweenNewsSource}
          onChange={(v) => handleSourceChange('betweenNews', v)}
        />
      )}

      {/* Between-news ads */}
      <AdSection title="Between News Ads" ads={betweenNews} onToggle={handleToggle} onDelete={setDeleteId} />

      {/* Sidebar ads */}
      <AdSection title="General Sidebar Ads (300×250)" ads={sidebar} onToggle={handleToggle} onDelete={setDeleteId} />

      {/* Banner ads */}
      <AdSection title="Full Banner Ads (728×90)" ads={banner} onToggle={handleToggle} onDelete={setDeleteId} />

      {/* Left panel ads */}
      <AdSection title="Left Side Panel Ads (160px wide · desktop only)" ads={leftPanel} onToggle={handleToggle} onDelete={setDeleteId} />

      {/* Right panel ads */}
      <AdSection title="Right Side Panel Ads (160px wide · desktop only)" ads={rightPanel} onToggle={handleToggle} onDelete={setDeleteId} />

      {/* Homepage-bottom: Google AdSense vs your own picture */}
      {sourceLoaded && (
        <AdSourceCard
          title="Homepage — Below Articles (Ad #6)"
          value={homepageBottomSource}
          onChange={(v) => handleSourceChange('homepageBottom', v)}
        />
      )}

      {/* Homepage-bottom ads */}
      <AdSection title="Homepage — Below Articles Ads (728×90)" ads={homepageBottom} onToggle={handleToggle} onDelete={setDeleteId} />

      {ads.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <div className="text-4xl mb-3">📢</div>
          <p className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>No advertisements yet</p>
          <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>Upload your first banner to get started.</p>
          <Link href="/admin/ads/new" className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: '#4a9e1f' }}>
            + New Ad
          </Link>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm space-y-4" style={{ background: 'white' }}>
            <h3 className="font-extrabold text-base" style={{ color: '#0f172a' }}>Delete this ad?</h3>
            <p className="text-sm" style={{ color: '#64748b' }}>This cannot be undone.</p>
            {deleteError && (
              <p className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626' }}>
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={doDelete} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#dc2626' }}>Delete</button>
              <button onClick={() => { setDeleteId(null); setDeleteError(null) }} className="flex-1 py-2 rounded-xl text-sm font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Lets the admin pick, per slot, whether this position shows the Google
// AdSense unit (the earning option) or falls back to this position's own
// uploaded picture. The change applies immediately — no separate save step.
function AdSourceCard({ title, value, onChange }: {
  title: string
  value: 'google' | 'manual'
  onChange: (value: 'google' | 'manual') => void
}) {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
      <div>
        <p className="font-bold text-sm" style={{ color: '#1e3a8a' }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#3b82f6' }}>
          Choose what shows in this spot right now.
        </p>
      </div>
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #93c5fd' }}>
        <button
          onClick={() => onChange('google')}
          className="px-4 py-2 text-xs font-bold transition-all"
          style={{
            background: value === 'google' ? '#2563eb' : 'white',
            color:      value === 'google' ? 'white' : '#2563eb',
          }}
        >
          Google AdSense
        </button>
        <button
          onClick={() => onChange('manual')}
          className="px-4 py-2 text-xs font-bold transition-all"
          style={{
            background: value === 'manual' ? '#2563eb' : 'white',
            color:      value === 'manual' ? 'white' : '#2563eb',
          }}
        >
          Your uploaded picture
        </button>
      </div>
    </div>
  )
}

function AdSection({ title, ads, onToggle, onDelete }: {
  title: string
  ads: Advertisement[]
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
}) {
  if (ads.length === 0) return null
  return (
    <div>
      <h3 className="text-sm font-extrabold mb-3" style={{ color: '#334155' }}>{title}</h3>
      <div className="space-y-3">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'white', border: '1px solid #e2e8f0', opacity: ad.is_active ? 1 : 0.6 }}
          >
            {/* Thumbnail */}
            <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: '80px', height: '60px' }}>
              <Image src={ad.image_url} alt={ad.title} fill sizes="80px" style={{ objectFit: 'cover' }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#0f172a' }}>{ad.title}</p>
              {ad.link_url && (
                <p className="text-xs truncate mt-0.5" style={{ color: '#94a3b8' }}>{ad.link_url}</p>
              )}
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Added {formatDate(ad.created_at)}</p>
            </div>

            {/* Status badge */}
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: ad.is_active ? '#f0fdf4' : '#f1f5f9',
                color:      ad.is_active ? '#16a34a' : '#94a3b8',
              }}
            >
              {ad.is_active ? 'Active' : 'Inactive'}
            </span>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onToggle(ad.id, ad.is_active)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: '#f1f5f9', color: '#475569' }}
              >
                {ad.is_active ? 'Pause' : 'Activate'}
              </button>
              <Link
                href={`/admin/ads/${ad.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: '#eff6ff', color: '#2563eb' }}
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(ad.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: '#fef2f2', color: '#dc2626' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Small numbered marker used both in the list and inside the blueprint
// diagram, so the same number visually ties an ad position to its spot.
function NumberBadge({ n, wide, tall }: { n: number; wide?: boolean; tall?: boolean }) {
  return (
    <div
      className="flex items-center justify-center font-black flex-shrink-0"
      style={{
        width: wide ? '100%' : tall ? '18px' : '22px',
        height: tall ? '100%' : '22px',
        minHeight: wide ? '22px' : undefined,
        borderRadius: 6,
        background: '#4a9e1f',
        color: 'white',
        fontSize: '11px',
      }}
    >
      {n}
    </div>
  )
}

// Generic gray placeholder rectangle standing in for a real homepage
// section in the blueprint diagram (not an actual ad slot itself).
function PlaceholderBox({ label, tall }: { label: string; tall?: boolean }) {
  return (
    <div
      className="flex items-center justify-center text-center"
      style={{
        background: '#f1f5f9',
        color: '#94a3b8',
        borderRadius: 6,
        fontSize: '9px',
        padding: '4px 2px',
        minHeight: tall ? '52px' : '22px',
      }}
    >
      {label}
    </div>
  )
}
