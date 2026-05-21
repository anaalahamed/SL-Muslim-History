'use client'

import { useState, useEffect } from 'react'
import { getCategories, saveCategory, deleteCategory } from '@/lib/db/categories'
import { Category } from '@/lib/types'

const ICON_OPTIONS = ['📜','🕌','🎨','👑','📖','🤝','🌙','⭐','📚','🏛️','🗺️','✍️','🎭','🔬','🕋','🌿','🏆','🎵']

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [nameEn,     setNameEn]     = useState('')
  const [nameTa,     setNameTa]     = useState('')
  const [slug,       setSlug]       = useState('')
  const [icon,       setIcon]       = useState('📜')
  const [parentId,   setParentId]   = useState<string>('')
  const [slugLocked, setSlugLocked] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  useEffect(() => { getCategories().then(setCategories) }, [])

  const topLevel = categories.filter((c) => !c.parent_id)
  const subOf    = (pid: string) => categories.filter((c) => c.parent_id === pid)

  function openNew(parentSlug = '') {
    setEditId(null); setNameEn(''); setNameTa(''); setSlug(''); setIcon('📜')
    setParentId(parentSlug ? (categories.find((c) => c.slug === parentSlug)?.id ?? '') : '')
    setSlugLocked(false); setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditId(cat.id); setNameEn(cat.name_en); setNameTa(cat.name_ta); setSlug(cat.slug); setIcon(cat.icon)
    setParentId(cat.parent_id ?? ''); setSlugLocked(true); setShowForm(true)
  }

  function handleNameEnChange(val: string) { setNameEn(val); if (!slugLocked) setSlug(toSlug(val)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload: Partial<Category> = { name_en: nameEn, name_ta: nameTa, slug, icon, article_count: 0, parent_id: parentId || null, ...(editId ? { id: editId } : {}) }
    const { data, error } = await saveCategory(payload)
    setSaving(false)
    if (!error && data) {
      setCategories((prev) => editId ? prev.map((c) => c.id === editId ? data : c) : [...prev, data])
      setSaved(true); setTimeout(() => { setSaved(false); setShowForm(false) }, 1200)
    }
  }

  async function doDelete() {
    if (deleteId) { await deleteCategory(deleteId); setCategories((prev) => prev.filter((c) => c.id !== deleteId)) }
    setDeleteId(null)
  }

  const IC = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all'
  const IS: React.CSSProperties = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Categories & Subcategories</h2>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{topLevel.length} categories, {categories.length - topLevel.length} subcategories</p>
        </div>
        {!showForm && (
          <button onClick={() => openNew()} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}>
            + New Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '2px solid #4a9e1f' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9', background: '#f0fdf4' }}>
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>{editId ? 'Edit Category' : 'New Category'}</h3>
            {saved && <span className="text-sm font-semibold" style={{ color: '#4a9e1f' }}>✅ Saved!</span>}
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Parent selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Type</label>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={IC} style={IS} onFocus={focus} onBlur={blur}>
                  <option value="">Top-level Category</option>
                  {topLevel.map((c) => <option key={c.id} value={c.id}>Subcategory of: {c.icon} {c.name_en}</option>)}
                </select>
              </div>

              {/* Icon */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-2" style={{ color: '#334155' }}>Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => setIcon(ic)} className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all" style={{ background: icon === ic ? '#f0fdf4' : '#f8fafc', border: `2px solid ${icon === ic ? '#4a9e1f' : '#e2e8f0'}`, transform: icon === ic ? 'scale(1.1)' : 'scale(1)' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name (English) <span style={{ color: '#dc2626' }}>*</span></label>
                <input required type="text" value={nameEn} onChange={(e) => handleNameEnChange(e.target.value)} placeholder="Early History" className={IC} style={IS} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name (Tamil) <span style={{ color: '#dc2626' }}>*</span></label>
                <input required type="text" value={nameTa} onChange={(e) => setNameTa(e.target.value)} placeholder="ஆரம்பகால வரலாறு" className={IC} style={{ ...IS, fontFamily: "'Noto Sans Tamil', sans-serif" }} onFocus={focus} onBlur={blur} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>URL Slug</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#94a3b8' }}>/category/</span>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} readOnly={slugLocked} className={IC} style={{ ...IS, paddingLeft: '78px', opacity: slugLocked ? 0.6 : 1 }} onFocus={focus} onBlur={blur} />
                  </div>
                  <button type="button" onClick={() => setSlugLocked(!slugLocked)} className="px-3 py-2 rounded-xl text-xs font-bold" style={{ background: slugLocked ? '#f1f5f9' : '#fef9c3', color: slugLocked ? '#64748b' : '#a16207', border: '1px solid #e2e8f0' }}>
                    {slugLocked ? '🔒' : '🔓'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: saving ? '#94a3b8' : '#4a9e1f' }}>
                {saving ? 'Saving...' : editId ? '💾 Update' : '✚ Add'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Category tree */}
      <div className="space-y-4">
        {topLevel.map((cat) => {
          const subs = subOf(cat.id)
          return (
            <div key={cat.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              {/* Parent row */}
              <div className="flex items-center gap-4 p-4" style={{ background: 'white', borderBottom: subs.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#f0fdf4' }}>{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold" style={{ color: '#0f172a' }}>{cat.name_en}</p>
                  <p className="text-xs" style={{ color: '#94a3b8', fontFamily: "'Noto Sans Tamil', sans-serif" }}>{cat.name_ta}</p>
                </div>
                <span className="text-xs font-black px-2 py-1 rounded-full" style={{ background: '#f0fdf4', color: '#15803d' }}>{cat.article_count}</span>
                <div className="flex gap-2">
                  <button onClick={() => openNew()} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#e0f2fe', color: '#0c447c' }}>+ Sub</button>
                  <button onClick={() => openEdit(cat)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f1f5f9', color: '#475569' }}>Edit</button>
                  <button onClick={() => setDeleteId(cat.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#fef2f2', color: '#dc2626' }}>Del</button>
                </div>
              </div>
              {/* Subcategory rows */}
              {subs.map((sub) => (
                <div key={sub.id} className="flex items-center gap-4 p-3 pl-10" style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: '#f0fdf4' }}>{sub.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: '#334155' }}>{sub.name_en}</p>
                    <p className="text-xs" style={{ color: '#94a3b8', fontFamily: "'Noto Sans Tamil', sans-serif" }}>{sub.name_ta}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#94a3b8' }}>{sub.article_count} articles</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(sub)} className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: '#f1f5f9', color: '#475569' }}>Edit</button>
                    <button onClick={() => setDeleteId(sub.id)} className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: '#fef2f2', color: '#dc2626' }}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h3 className="text-base font-extrabold text-center mb-2" style={{ color: '#0f172a' }}>Delete Category?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>Articles will not be deleted but will become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#f1f5f9', color: '#475569' }}>Cancel</button>
              <button onClick={doDelete} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#dc2626' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
