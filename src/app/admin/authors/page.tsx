'use client'

import { useState, useEffect } from 'react'
import { getAuthors, saveAuthor, deleteAuthor } from '@/lib/db/authors'
import { Author } from '@/lib/types'

export default function AdminAuthorsPage() {
  const [authors,  setAuthors]  = useState<Author[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [name,     setName]     = useState('')
  const [nameTa,   setNameTa]   = useState('')
  const [bio,      setBio]      = useState('')
  const [link,     setLink]     = useState('')

  useEffect(() => { getAuthors().then(setAuthors) }, [])

  function openNew() { setEditId(null); setName(''); setNameTa(''); setBio(''); setLink(''); setShowForm(true) }
  function openEdit(a: Author) { setEditId(a.id); setName(a.name); setNameTa(a.name_ta); setBio(a.bio); setLink(a.profile_link); setShowForm(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload: Partial<Author> = { name, name_ta: nameTa, bio, profile_link: link, avatar_url: '', ...(editId ? { id: editId } : {}) }
    const { data, error } = await saveAuthor(payload)
    setSaving(false)
    if (!error && data) {
      setAuthors((prev) => editId ? prev.map((a) => a.id === editId ? data : a) : [...prev, data])
      setSaved(true); setTimeout(() => { setSaved(false); setShowForm(false) }, 1200)
    }
  }

  async function doDelete() {
    if (deleteId) { await deleteAuthor(deleteId); setAuthors((prev) => prev.filter((a) => a.id !== deleteId)) }
    setDeleteId(null)
  }

  const IC = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all'
  const IS: React.CSSProperties = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Authors</h2>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{authors.length} authors</p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}>
            + New Author
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '2px solid #4a9e1f' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9', background: '#f0fdf4' }}>
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>{editId ? 'Edit Author' : 'New Author'}</h3>
            {saved && <span className="text-sm font-semibold" style={{ color: '#4a9e1f' }}>✅ Saved!</span>}
          </div>
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name (English) <span style={{ color: '#dc2626' }}>*</span></label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mohamed Farook" className={IC} style={IS} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name (Tamil)</label>
              <input type="text" value={nameTa} onChange={(e) => setNameTa(e.target.value)} placeholder="முஹம்மட் பாரூக்" className={IC} style={{ ...IS, fontFamily: "'Noto Sans Tamil', sans-serif" }} onFocus={focus} onBlur={blur} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Bio</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short biography..." className={IC} style={{ ...IS, resize: 'vertical' as const }} onFocus={focus} onBlur={blur} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Profile / Contact Link</label>
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className={IC} style={IS} onFocus={focus} onBlur={blur} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: saving ? '#94a3b8' : '#4a9e1f' }}>
                {saving ? 'Saving...' : editId ? '💾 Update' : '✚ Add Author'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((a) => (
          <div key={a.id} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0" style={{ background: '#f0fdf4', color: '#4a9e1f' }}>
                {a.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold truncate" style={{ color: '#0f172a' }}>{a.name}</p>
                {a.name_ta && <p className="text-xs truncate" style={{ color: '#94a3b8', fontFamily: "'Noto Sans Tamil', sans-serif" }}>{a.name_ta}</p>}
                {a.profile_link && <a href={a.profile_link} target="_blank" rel="noopener noreferrer" className="text-xs block truncate" style={{ color: '#4a9e1f' }}>🔗 Profile</a>}
              </div>
            </div>
            {a.bio && <p className="text-xs mb-3" style={{ color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.bio}</p>}
            <div className="flex gap-2">
              <button onClick={() => openEdit(a)} className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: '#f1f5f9', color: '#475569' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}>Edit</button>
              <button onClick={() => setDeleteId(a.id)} className="flex-1 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#fef2f2', color: '#dc2626' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h3 className="text-base font-extrabold text-center mb-2" style={{ color: '#0f172a' }}>Delete Author?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>Articles will not be deleted.</p>
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
