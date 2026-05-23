'use client'

import { useState } from 'react'
import Link from 'next/link'
import NewsForm from '@/components/admin/NewsForm'
import { saveNews } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'

export default function NewNewsPage() {
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  async function handleSave(data: Partial<NewsPost>) {
    setSaving(true)
    setError(null)
    const { data: saved, error } = await saveNews(data)
    setSaving(false)
    if (error) { setError(error); return }
    if (saved) setDone(true)
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
        <Link href="/admin" className="hover:text-green-700 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/news" className="hover:text-green-700 transition-colors">News</Link>
        <span>/</span>
        <span style={{ color: '#1e293b' }}>New Post</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Write New Post</h2>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {done ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'white', border: '1px solid #e2e8f0' }}
        >
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-extrabold mb-2" style={{ color: '#0f172a' }}>Post Published!</h3>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            Your news post has been saved successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/admin/news"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#4a9e1f' }}
            >
              Back to News
            </Link>
            <button
              onClick={() => setDone(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: '#f1f5f9', color: '#475569' }}
            >
              Write Another
            </button>
          </div>
        </div>
      ) : (
        <NewsForm onSave={handleSave} saving={saving} />
      )}
    </div>
  )
}
