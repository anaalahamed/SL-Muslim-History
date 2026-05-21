'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatDate, formatViews } from '@/lib/utils'
import { getArticles, deleteArticle, toggleArticleFeatured } from '@/lib/db/articles'
import { getCategories } from '@/lib/db/categories'
import { Article } from '@/lib/types'
import { Category } from '@/lib/types'

export default function AdminArticlesPage() {
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('all')
  const [filterFeat,  setFilterFeat]  = useState('all')
  const [articles,    setArticles]    = useState<Article[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [deleteId,    setDeleteId]    = useState<string | null>(null)

  useEffect(() => {
    getArticles().then(setArticles)
    getCategories().then(setCategories)
  }, [])

  const filtered = articles
    .filter((a) => filterCat  === 'all' || a.category_slug === filterCat)
    .filter((a) => filterFeat === 'all' || (filterFeat === 'featured' ? a.is_featured : !a.is_featured))
    .filter((a) =>
      search.trim() === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase())
    )

  async function toggleFeatured(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    await toggleArticleFeatured(id, !article.is_featured)
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, is_featured: !a.is_featured } : a))
  }

  function confirmDelete(id: string) { setDeleteId(id) }
  async function doDelete() {
    if (deleteId) {
      await deleteArticle(deleteId)
      setArticles((prev) => prev.filter((a) => a.id !== deleteId))
    }
    setDeleteId(null)
  }

  return (
    <div className="max-w-7xl space-y-5">

      {/* Header row */}
      <div>
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Articles</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{articles.length} total articles</p>
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
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {/* Category filter */}
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold outline-none cursor-pointer"
          style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name_en}</option>)}
        </select>

        {/* Featured filter */}
        <select
          value={filterFeat}
          onChange={(e) => setFilterFeat(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold outline-none cursor-pointer"
          style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}
        >
          <option value="all">All Articles</option>
          <option value="featured">Featured only</option>
          <option value="regular">Not featured</option>
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
          style={{ gridTemplateColumns: '2fr 1fr 1fr auto auto auto', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', color: '#94a3b8' }}
        >
          <span>Title</span>
          <span>Category</span>
          <span>Author · Date</span>
          <span>Views</span>
          <span>Featured</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold" style={{ color: '#64748b' }}>No articles found</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((article, i) => (
            <div
              key={article.id}
              className="grid gap-4 px-5 py-4 items-center transition-colors"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr auto auto auto',
                borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {/* Title */}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{article.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>/articles/{article.slug}</p>
              </div>

              {/* Category */}
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full self-start"
                style={{ background: '#f0fdf4', color: '#15803d' }}
              >
                {article.category}
              </span>

              {/* Author + date */}
              <div>
                <p className="text-xs font-semibold" style={{ color: '#475569' }}>{article.author}</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{formatDate(article.published_at)}</p>
              </div>

              {/* Views */}
              <span className="text-sm font-bold" style={{ color: '#64748b' }}>
                👁 {formatViews(article.views)}
              </span>

              {/* Featured toggle */}
              <button
                onClick={() => toggleFeatured(article.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: article.is_featured ? '#f0fdf4' : '#f8fafc',
                  color:      article.is_featured ? '#15803d' : '#94a3b8',
                  border:     `1px solid ${article.is_featured ? '#bbf7d0' : '#e2e8f0'}`,
                }}
              >
                {article.is_featured ? '✦ Featured' : '○ Regular'}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: '#f1f5f9', color: '#475569' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => confirmDelete(article.id)}
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
            <h3 className="text-base font-extrabold text-center mb-2" style={{ color: '#0f172a' }}>Delete Article?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>
              This action cannot be undone. The article will be permanently removed.
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
