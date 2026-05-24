'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { getNews, deleteNews } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'

export default function AdminNewsPage() {
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState<'all' | 'special' | 'janaza'>('all')
  const [news,       setNews]       = useState<NewsPost[]>([])
  const [deleteId,   setDeleteId]   = useState<string | null>(null)

  useEffect(() => {
    getNews().then(setNews)
  }, [])

  const filtered = news
    .filter((n) => filterType === 'all' || n.news_type === filterType)
    .filter((n) =>
      search.trim() === '' ||
      n.title.toLowerCase().includes(search.toLowerCase())
    )

  async function doDelete() {
    if (deleteId) {
      await deleteNews(deleteId)
      setNews((prev) => prev.filter((n) => n.id !== deleteId))
    }
    setDeleteId(null)
  }

  return (
    <div className="max-w-7xl space-y-5">

      {/* Header row */}
      <div>
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>News Posts</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{news.length} total posts</p>
      </div>

      {/* Filter bar */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
        style={{ background: 'white', border: '1px solid #e2e8f0' }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'special' | 'janaza')}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold outline-none cursor-pointer"
          style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}
        >
          <option value="all">All Posts</option>
          <option value="special">சிறப்புச் செய்திகள் only</option>
          <option value="janaza">Janaza News only</option>
        </select>

        <span className="flex items-center text-xs font-semibold px-3" style={{ color: '#94a3b8' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #e2e8f0' }}
      >
        {/* Table head */}
        <div
          className="grid gap-4 px-5 py-3 text-xs font-black uppercase tracking-wider"
          style={{ gridTemplateColumns: '2fr 1fr 1fr auto', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', color: '#94a3b8' }}
        >
          <span>Title</span>
          <span>Type</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold" style={{ color: '#64748b' }}>No posts found</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((post, i) => (
            <div
              key={post.id}
              className="grid gap-4 px-5 py-4 items-center transition-colors"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr auto',
                borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {/* Title */}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{post.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>/news/{post.slug}</p>
              </div>

              {/* Type badge */}
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full self-start"
                style={
                  post.news_type === 'janaza'
                    ? { background: '#f0f9ff', color: '#0369a1' }
                    : { background: '#f0fdf4', color: '#166534' }
                }
              >
                {post.news_type === 'janaza' ? 'Janaza' : 'சிறப்பு'}
              </span>

              {/* Date */}
              <p className="text-xs" style={{ color: '#94a3b8' }}>{formatDate(post.published_at)}</p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/news/${post.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: '#f1f5f9', color: '#475569' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteId(post.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: '#fef2f2', color: '#dc2626' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
          >
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h3 className="text-base font-extrabold text-center mb-2" style={{ color: '#0f172a' }}>Delete Post?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>
              This action cannot be undone. The post will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: '#f1f5f9', color: '#475569' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: '#dc2626' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#dc2626' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
