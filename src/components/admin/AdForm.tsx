'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Advertisement } from '@/lib/types'
import ImageUpload from './ImageUpload'

interface Props {
  initial?: Partial<Advertisement>
  onSave: (data: Partial<Advertisement>) => void
  saving?: boolean
}

const POSITIONS: { value: Advertisement['position']; label: string; desc: string }[] = [
  { value: 'between-news', label: '📰 Between News & Latest News',    desc: 'Sidebar — between Special News and Latest News sections (~4–6cm tall)' },
  { value: 'sidebar',      label: '📌 General Sidebar',               desc: 'General sidebar placement' },
  { value: 'banner',       label: '🖥️ Full Banner',                   desc: 'Wide banner across the page' },
]

export default function AdForm({ initial = {}, onSave, saving }: Props) {
  const [title,    setTitle]    = useState(initial.title    ?? '')
  const [linkUrl,  setLinkUrl]  = useState(initial.link_url ?? '')
  const [position, setPosition] = useState<Advertisement['position']>(initial.position ?? 'between-news')
  const [isActive, setIsActive] = useState(initial.is_active ?? true)
  const [image,    setImage]    = useState(initial.image_url ?? '')

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all'
  const IS: React.CSSProperties = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({ title, link_url: linkUrl, position, is_active: isActive, image_url: image })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="rounded-2xl p-5 space-y-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <h3 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>Ad Details</h3>

        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Ad Title <span style={{ color: '#dc2626' }}>*</span></label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sponsor Banner Jan 2025" className={inputClass} style={IS} onFocus={focus} onBlur={blur} />
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Internal label — not shown to visitors</p>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Destination URL</label>
          <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className={inputClass} style={IS} onFocus={focus} onBlur={blur} />
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Where users go when they click the ad. Leave blank for non-clickable.</p>
        </div>

        <div>
          <label className="block text-xs font-bold mb-2" style={{ color: '#334155' }}>Placement Position</label>
          <div className="space-y-2">
            {POSITIONS.map((p) => (
              <label key={p.value} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all" style={{ background: position === p.value ? '#f0fdf4' : '#f8fafc', border: `1px solid ${position === p.value ? '#4a9e1f' : '#e2e8f0'}` }}>
                <input type="radio" name="position" value={p.value} checked={position === p.value} onChange={() => setPosition(p.value)} className="mt-0.5 accent-green-600" />
                <div>
                  <p className="text-xs font-bold" style={{ color: '#1e293b' }}>{p.label}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{p.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: isActive ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isActive ? '#4a9e1f' : '#e2e8f0'}` }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>Active</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Show this ad on the website</p>
          </div>
          <button type="button" onClick={() => setIsActive(!isActive)} className="relative w-11 h-6 rounded-full transition-all" style={{ background: isActive ? '#4a9e1f' : '#e2e8f0' }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: isActive ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <h3 className="text-sm font-extrabold mb-1" style={{ color: '#0f172a' }}>Ad Image</h3>
        <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
          For &quot;Between News&quot; position: recommended width matches the sidebar (~300px), height ~120–180px (4–6cm).
        </p>
        <ImageUpload value={image} onChange={setImage} />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saving ? '#94a3b8' : '#4a9e1f', boxShadow: saving ? 'none' : '0 2px 8px rgba(74,158,31,0.3)' }}>
          {saving ? 'Saving...' : initial.id ? '💾 Update Ad' : '🚀 Publish Ad'}
        </button>
        <Link href="/admin/ads" className="px-6 py-2.5 rounded-xl text-sm font-bold text-center" style={{ background: '#f1f5f9', color: '#64748b' }}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
