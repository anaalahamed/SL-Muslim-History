'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { getCategories } from '@/lib/db/categories'
import { getAuthors, saveAuthor } from '@/lib/db/authors'
import { getArticles } from '@/lib/db/articles'
import { Article, Category, Author, GalleryImage } from '@/lib/types'
import ImageUpload from './ImageUpload'
import { supabase } from '@/lib/supabase'

interface Props {
  initial?: Partial<Article>
  onSave: (data: Partial<Article>) => void
  saving?: boolean
}

function toSlug(text: string) {
  const ascii = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
  if (!ascii) return `article-${Date.now()}`
  return ascii
}

function uid() { return Math.random().toString(36).slice(2) }

export default function ArticleForm({ initial = {}, onSave, saving }: Props) {
  // ── Data ──
  const [categories, setCategories] = useState<Category[]>([])
  const [authors,    setAuthors]    = useState<Author[]>([])
  const [nextNum,    setNextNum]    = useState(46)
  useEffect(() => {
    getCategories().then(setCategories)
    getAuthors().then(setAuthors)
    if (!initial.id) {
      getArticles().then(articles => {
        const nums = articles
          .map(a => { const m = a.slug.match(/^(\d+)-/); return m ? parseInt(m[1]) : 0 })
          .filter(n => n >= 46)
        setNextNum(nums.length > 0 ? Math.max(...nums) + 1 : 46)
      })
    }
  }, [initial.id])

  const contentRef = useRef<HTMLTextAreaElement>(null)

  function insertMarkdown(before: string, after = '', placeholder = '') {
    const ta = contentRef.current; if (!ta) return
    const start = ta.selectionStart; const end = ta.selectionEnd
    const sel = content.slice(start, end) || placeholder
    const next = content.slice(0, start) + before + sel + after + content.slice(end)
    setContent(next)
    setTimeout(() => { ta.focus(); const cur = start + before.length + sel.length; ta.setSelectionRange(cur, cur) }, 0)
  }

  // ── Fields ──
  const [title,       setTitle]      = useState(initial.title     ?? '')
  const [slug,        setSlug]       = useState(initial.slug      ?? '')
  const [content,     setContent]    = useState(initial.content   ?? '')
  const [featured,    setFeatured]   = useState(initial.is_featured ?? false)
  const [slugLocked,  setSlugLocked] = useState(!!initial.slug)
  const [slugError,   setSlugError]  = useState('')
  const [image,       setImage]      = useState(initial.featured_image ?? '')

  // ── Multiple categories ──
  const [selCats, setSelCats] = useState<string[]>(
    initial.categories?.length ? initial.categories : (initial.category_slug ? [initial.category_slug] : [])
  )
  function toggleCat(slug: string) {
    setSelCats((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])
  }

  // ── Author ──
  const [authorMode, setAuthorMode]   = useState<'select' | 'new'>('select')
  const [authorId,   setAuthorId]     = useState(initial.author_id ?? '')
  const [authorLink, setAuthorLink]   = useState(initial.author_link ?? '')
  // new author inline
  const [newAuthorName,    setNewAuthorName]    = useState('')
  const [newAuthorNameTa,  setNewAuthorNameTa]  = useState('')
  const [newAuthorBio,     setNewAuthorBio]     = useState('')
  const [newAuthorLink,    setNewAuthorLink]    = useState('')
  const [savingAuthor,     setSavingAuthor]     = useState(false)
  const [savedAuthorMsg,   setSavedAuthorMsg]   = useState('')

  async function handleSaveNewAuthor() {
    if (!newAuthorName.trim()) return
    setSavingAuthor(true)
    const { data, error } = await saveAuthor({ name: newAuthorName, name_ta: newAuthorNameTa, bio: newAuthorBio, profile_link: newAuthorLink, avatar_url: '' })
    setSavingAuthor(false)
    if (!error && data) {
      setAuthors((prev) => [...prev, data])
      setAuthorId(data.id)
      setAuthorLink(data.profile_link)
      setSavedAuthorMsg('Author saved! Now selected.')
      setAuthorMode('select')
      setTimeout(() => setSavedAuthorMsg(''), 3000)
    }
  }

  // ── Gallery ──
  const [gallery,        setGallery]        = useState<GalleryImage[]>(initial.gallery ?? [])
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryError,   setGalleryError]   = useState<string | null>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  async function uploadGalleryFiles(files: File[]) {
    setGalleryUploading(true)
    setGalleryError(null)
    for (const file of files) {
      try {
        let url: string
        if (supabase) {
          const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const path = `${Date.now()}-${safe}`
          const { data, error } = await supabase.storage.from('media').upload(path, file, { upsert: false })
          if (error) { setGalleryError(error.message); continue }
          url = supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl
        } else {
          url = URL.createObjectURL(file)
          setGalleryError('Supabase not connected — gallery URLs are temporary.')
        }
        addGalleryImage(url)
      } catch {
        setGalleryError('Failed to upload one or more images.')
      }
    }
    setGalleryUploading(false)
  }

  function addGalleryImage(url: string) {
    const img: GalleryImage = { id: uid(), url, caption: '', order: gallery.length, is_featured: gallery.length === 0 }
    setGallery((prev) => [...prev, img])
  }

  function setFeaturedGalleryImage(id: string) {
    setGallery((prev) => prev.map((img) => ({ ...img, is_featured: img.id === id })))
    const feat = gallery.find((g) => g.id === id)
    if (feat) setImage(feat.url)
  }

  function moveGalleryImage(id: string, dir: 'up' | 'down') {
    setGallery((prev) => {
      const idx = prev.findIndex((g) => g.id === id)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next.map((g, i) => ({ ...g, order: i }))
    })
  }

  function removeGalleryImage(id: string) {
    setGallery((prev) => {
      const filtered = prev.filter((g) => g.id !== id)
      if (!filtered.some((g) => g.is_featured) && filtered.length > 0) {
        filtered[0].is_featured = true
        setImage(filtered[0].url)
      }
      return filtered
    })
  }

  function updateCaption(id: string, caption: string) {
    setGallery((prev) => prev.map((g) => g.id === id ? { ...g, caption } : g))
  }

  // ── Submit ──
  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugLocked) {
      const numStr  = String(nextNum).padStart(3, '0')
      const txtSlug = toSlug(val)
      setSlug(txtSlug ? `${numStr}-${txtSlug}` : numStr)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const cleanSlug = slug.trim()
    if (!cleanSlug) { setSlugError('URL slug is required.'); return }
    if (/[^\w-]/.test(cleanSlug)) { setSlugError('Slug can only contain letters, numbers, and hyphens.'); return }
    setSlugError('')
    const primaryCat = categories.find((c) => c.slug === selCats[0])
    const selectedAuthor = authors.find((a) => a.id === authorId)
    const galleryWithFeatured = gallery.map((g, i) => ({ ...g, order: i }))
    const featuredGalleryImg = galleryWithFeatured.find((g) => g.is_featured)
    onSave({
      title, slug: cleanSlug, content,
      category:      primaryCat?.name_en ?? '',
      category_slug: selCats[0] ?? '',
      categories:    selCats,
      author:        selectedAuthor?.name ?? newAuthorName ?? '',
      author_id:     authorId || null,
      author_link:   authorLink || selectedAuthor?.profile_link || '',
      is_featured:   featured,
      featured_image: featuredGalleryImg?.url || image,
      gallery:       galleryWithFeatured,
      published_at:  initial.published_at ?? new Date().toISOString(),
      ...(initial.id ? {} : { views: 26 }),
    })
  }

  // ── Styles ──
  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all'
  const IS = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }

  const topLevelCats = categories.filter((c) => !c.parent_id)
  const subCatsByParent = (parentId: string) => categories.filter((c) => c.parent_id === parentId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Main content ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Content card */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#0f172a' }}>Article Content</h3>
            <div className="space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Title (Tamil) <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" required value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="அரபு வணிகர்கள்..." className={inputClass} style={{ ...IS, fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: '1rem' }} onFocus={focus} onBlur={blur} />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>URL Slug <span className="font-normal" style={{ color: '#94a3b8' }}>(English, auto-generated)</span></label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#94a3b8' }}>/articles/</span>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} readOnly={slugLocked} className={inputClass} style={{ ...IS, paddingLeft: '68px', opacity: slugLocked ? 0.6 : 1 }} onFocus={focus} onBlur={blur} />
                  </div>
                  <button type="button" onClick={() => setSlugLocked(!slugLocked)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0" style={{ background: slugLocked ? '#f1f5f9' : '#fef9c3', color: slugLocked ? '#64748b' : '#a16207', border: '1px solid #e2e8f0' }}>
                    {slugLocked ? '🔒 Locked' : '🔓 Editing'}
                  </button>
                </div>
                {slugError && <p className="text-xs mt-1.5 font-semibold" style={{ color: '#dc2626' }}>{slugError}</p>}
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Full Content (Tamil)</label>
                <div className="flex flex-wrap gap-1 px-2 py-1.5 rounded-t-xl" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderBottom: 'none' }}>
                  {[
                    { label: 'H2', action: () => insertMarkdown('## ', '', 'Heading') },
                    { label: 'H3', action: () => insertMarkdown('### ', '', 'Heading') },
                    { label: 'B',  action: () => insertMarkdown('**', '**', 'bold'), bold: true },
                    { label: 'I',  action: () => insertMarkdown('*', '*', 'italic'), italic: true },
                    { label: '""', action: () => insertMarkdown('> ', '', 'quote') },
                    { label: '—',  action: () => insertMarkdown('\n\n---\n\n') },
                    { label: '• ', action: () => insertMarkdown('- ', '', 'list item') },
                    { label: '1.', action: () => insertMarkdown('1. ', '', 'list item') },
                    { label: '🔗', action: () => insertMarkdown('[', '](url)', 'link text') },
                  ].map((btn) => (
                    <button key={btn.label} type="button" onClick={btn.action} className="px-2 py-0.5 rounded text-xs transition-all" style={{ background: 'white', color: '#475569', border: '1px solid #e2e8f0', fontWeight: btn.bold ? 700 : 400, fontStyle: btn.italic ? 'italic' : 'normal', minWidth: '28px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569' }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
                <textarea ref={contentRef} rows={14} value={content} onChange={(e) => setContent(e.target.value)} placeholder="கட்டுரையின் முழு உள்ளடக்கம்..." className={inputClass} style={{ ...IS, resize: 'vertical', fontFamily: "'Noto Sans Tamil', monospace, sans-serif", lineHeight: '1.8', borderTopLeftRadius: 0, borderTopRightRadius: 0 }} onFocus={focus} onBlur={blur} />
              </div>
            </div>
          </div>

          {/* ── GALLERY ── */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>📷 Photo Gallery</h3>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Upload multiple photos. Click ⭐ to set as featured thumbnail.</p>
              </div>
              <button type="button" onClick={() => galleryRef.current?.click()} disabled={galleryUploading} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: galleryUploading ? '#94a3b8' : '#4a9e1f' }}>
                {galleryUploading ? '⏳ Uploading...' : '+ Add Photos'}
              </button>
            </div>
            {galleryError && <p className="text-xs mb-3 font-semibold" style={{ color: '#dc2626' }}>{galleryError}</p>}

            {/* Hidden file input for gallery */}
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              if (galleryRef.current) galleryRef.current.value = ''
              uploadGalleryFiles(files)
            }} />

            {/* URL add */}
            <div className="flex gap-2 mb-4">
              <input id="gallery-url-input" type="url" placeholder="Or paste image URL here..." className={inputClass} style={IS} onFocus={focus} onBlur={blur} />
              <button type="button" className="px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                onClick={() => {
                  const inp = document.getElementById('gallery-url-input') as HTMLInputElement
                  if (inp?.value.trim()) { addGalleryImage(inp.value.trim()); inp.value = '' }
                }}>
                Add URL
              </button>
            </div>

            {gallery.length === 0 ? (
              <div className="rounded-xl py-10 text-center" style={{ border: '2px dashed #e2e8f0' }}>
                <p className="text-2xl mb-2">🖼️</p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>No photos added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gallery.map((img, i) => (
                  <div key={img.id} className="flex gap-3 items-start p-3 rounded-xl" style={{ border: `2px solid ${img.is_featured ? '#4a9e1f' : '#e2e8f0'}`, background: img.is_featured ? '#f0fdf4' : '#f8fafc' }}>
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: '#e2e8f0' }}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {img.is_featured && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#4a9e1f', color: 'white' }}>⭐ Featured Photo</span>}
                        <span className="text-xs" style={{ color: '#94a3b8' }}>Photo {i + 1}</span>
                      </div>
                      <input type="text" value={img.caption} onChange={(e) => updateCaption(img.id, e.target.value)} placeholder="Add caption (optional)..." className="w-full px-3 py-1.5 rounded-lg text-xs outline-none" style={IS} onFocus={focus} onBlur={blur} />
                    </div>
                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {!img.is_featured && (
                        <button type="button" onClick={() => setFeaturedGalleryImage(img.id)} title="Set as featured" className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all" style={{ background: '#fef9c3', border: '1px solid #e2e8f0' }}>⭐</button>
                      )}
                      <button type="button" onClick={() => moveGalleryImage(img.id, 'up')} disabled={i === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all" style={{ background: '#f1f5f9', opacity: i === 0 ? 0.4 : 1 }}>↑</button>
                      <button type="button" onClick={() => moveGalleryImage(img.id, 'down')} disabled={i === gallery.length - 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all" style={{ background: '#f1f5f9', opacity: i === gallery.length - 1 ? 0.4 : 1 }}>↓</button>
                      <button type="button" onClick={() => removeGalleryImage(img.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all" style={{ background: '#fef2f2', color: '#dc2626' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT: Settings ── */}
        <div className="space-y-5">

          {/* Publish */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#0f172a' }}>Publish</h3>

            {/* Featured toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl mb-4" style={{ background: featured ? '#f0fdf4' : '#f8fafc', border: `1px solid ${featured ? '#4a9e1f' : '#e2e8f0'}` }}>
              <div>
                <p className="text-sm font-bold" style={{ color: '#1e293b' }}>⭐ Featured Article</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Appears in Featured section below slider</p>
              </div>
              <button type="button" onClick={() => setFeatured(!featured)} className="relative w-11 h-6 rounded-full transition-all flex-shrink-0" style={{ background: featured ? '#4a9e1f' : '#e2e8f0' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: featured ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saving ? '#94a3b8' : '#4a9e1f', boxShadow: saving ? 'none' : '0 2px 8px rgba(74,158,31,0.3)' }}>
                {saving ? 'Saving...' : initial.id ? '💾 Update Article' : '🚀 Publish Article'}
              </button>
              <Link href="/admin/articles" className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all block" style={{ background: '#f1f5f9', color: '#64748b' }}>Cancel</Link>
            </div>
          </div>

          {/* ── CATEGORIES (multi + subcategories) ── */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 className="text-sm font-extrabold mb-1" style={{ color: '#0f172a' }}>Categories</h3>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Select one or more. First selected = primary.</p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {topLevelCats.map((cat) => {
                const subs = subCatsByParent(cat.id)
                return (
                  <div key={cat.id}>
                    {/* Parent category */}
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all" style={{ background: selCats.includes(cat.slug) ? '#f0fdf4' : '#f8fafc', border: `1px solid ${selCats.includes(cat.slug) ? '#4a9e1f' : '#e2e8f0'}` }}>
                      <input type="checkbox" checked={selCats.includes(cat.slug)} onChange={() => toggleCat(cat.slug)} className="w-4 h-4 accent-green-600" />
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-bold flex-1" style={{ color: '#1e293b' }}>{cat.name_en}</span>
                      {selCats[0] === cat.slug && <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#4a9e1f', color: 'white' }}>Primary</span>}
                    </label>
                    {/* Subcategories */}
                    {subs.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {subs.map((sub) => (
                          <label key={sub.id} className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all" style={{ background: selCats.includes(sub.slug) ? '#f0fdf4' : '#f8fafc', border: `1px solid ${selCats.includes(sub.slug) ? '#86efac' : '#e2e8f0'}` }}>
                            <input type="checkbox" checked={selCats.includes(sub.slug)} onChange={() => toggleCat(sub.slug)} className="w-3.5 h-3.5 accent-green-600" />
                            <span className="text-sm">{sub.icon}</span>
                            <span className="text-xs flex-1" style={{ color: '#475569' }}>{sub.name_en}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {selCats.length === 0 && <p className="text-xs mt-2" style={{ color: '#f59e0b' }}>⚠ Please select at least one category</p>}
          </div>

          {/* ── AUTHOR ── */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>Author</h3>

            {/* Mode tabs */}
            <div className="flex gap-2 mb-4">
              {(['select', 'new'] as const).map((m) => (
                <button key={m} type="button" onClick={() => setAuthorMode(m)} className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: authorMode === m ? '#4a9e1f' : '#f1f5f9', color: authorMode === m ? 'white' : '#64748b' }}>
                  {m === 'select' ? '📋 Select Author' : '✚ New Author'}
                </button>
              ))}
            </div>

            {authorMode === 'select' ? (
              <div className="space-y-3">
                <select value={authorId} onChange={(e) => { setAuthorId(e.target.value); setAuthorLink(authors.find((a) => a.id === e.target.value)?.profile_link ?? '') }} className={inputClass} style={IS} onFocus={focus} onBlur={blur}>
                  <option value="">Select an author</option>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name}{a.name_ta ? ` — ${a.name_ta}` : ''}</option>)}
                </select>
                {savedAuthorMsg && <p className="text-xs font-semibold" style={{ color: '#4a9e1f' }}>✅ {savedAuthorMsg}</p>}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Profile / Contact Link <span className="font-normal" style={{ color: '#94a3b8' }}>(optional)</span></label>
                  <input type="url" value={authorLink} onChange={(e) => setAuthorLink(e.target.value)} placeholder="https://..." className={inputClass} style={IS} onFocus={focus} onBlur={blur} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name (English) <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="text" value={newAuthorName} onChange={(e) => setNewAuthorName(e.target.value)} placeholder="Mohamed Farook" className={inputClass} style={IS} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name (Tamil)</label>
                  <input type="text" value={newAuthorNameTa} onChange={(e) => setNewAuthorNameTa(e.target.value)} placeholder="முஹம்மட் பாரூக்" className={inputClass} style={{ ...IS, fontFamily: "'Noto Sans Tamil', sans-serif" }} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Bio <span className="font-normal" style={{ color: '#94a3b8' }}>(optional)</span></label>
                  <textarea rows={2} value={newAuthorBio} onChange={(e) => setNewAuthorBio(e.target.value)} placeholder="Short bio..." className={inputClass} style={{ ...IS, resize: 'none' }} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Profile / Contact Link</label>
                  <input type="url" value={newAuthorLink} onChange={(e) => setNewAuthorLink(e.target.value)} placeholder="https://..." className={inputClass} style={IS} onFocus={focus} onBlur={blur} />
                </div>
                <button type="button" disabled={savingAuthor || !newAuthorName.trim()} onClick={handleSaveNewAuthor} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all" style={{ background: savingAuthor || !newAuthorName.trim() ? '#94a3b8' : '#4a9e1f' }}>
                  {savingAuthor ? 'Saving Author...' : '💾 Save Author & Select'}
                </button>
              </div>
            )}
          </div>

          {/* Featured Image (fallback if no gallery) */}
          {gallery.length === 0 && (
            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <h3 className="text-sm font-extrabold mb-1" style={{ color: '#0f172a' }}>Featured Image</h3>
              <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Or use the Gallery above to manage multiple photos.</p>
              <ImageUpload value={image} onChange={setImage} />
            </div>
          )}

        </div>
      </div>
    </form>
  )
}
