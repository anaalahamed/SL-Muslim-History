'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getAllAds, deleteAd, toggleAdActive } from '@/lib/db/ads'
import { Advertisement } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function AdminAdsPage() {
  const [ads,        setAds]      = useState<Advertisement[]>([])
  const [deleteId,   setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => { getAllAds().then(setAds) }, [])

  async function handleToggle(id: string, current: boolean) {
    await toggleAdActive(id, !current)
    setAds((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !current } : a))
  }

  async function doDelete() {
    if (!deleteId) return
    const err = await deleteAd(deleteId)
    if (err) { setDeleteError(err); return }
    setAds((prev) => prev.filter((a) => a.id !== deleteId))
    setDeleteId(null)
    setDeleteError(null)
  }

  const betweenNews = ads.filter((a) => a.position === 'between-news')
  const sidebar     = ads.filter((a) => a.position === 'sidebar')
  const banner      = ads.filter((a) => a.position === 'banner')

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

      {/* Info box */}
      <div className="rounded-2xl p-4 text-sm" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <p className="font-bold mb-1" style={{ color: '#166534' }}>Three ad positions available:</p>
        <ul className="text-xs space-y-1" style={{ color: '#15803d' }}>
          <li><strong>Between News</strong> — Sidebar ad between Special News and Latest News sections</li>
          <li><strong>General Sidebar</strong> — 300×250 box, appears in the right sidebar on article, news, category, and search pages</li>
          <li><strong>Full Banner</strong> — 728×90 leaderboard, appears between sections on the homepage and listing pages</li>
        </ul>
      </div>

      {/* Between-news ads */}
      <AdSection title="Between News Ads" ads={betweenNews} onToggle={handleToggle} onDelete={setDeleteId} />

      {/* Sidebar ads */}
      <AdSection title="General Sidebar Ads (300×250)" ads={sidebar} onToggle={handleToggle} onDelete={setDeleteId} />

      {/* Banner ads */}
      <AdSection title="Full Banner Ads (728×90)" ads={banner} onToggle={handleToggle} onDelete={setDeleteId} />

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
