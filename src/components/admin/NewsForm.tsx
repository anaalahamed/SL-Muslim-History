'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { NewsPost } from '@/lib/types'
import ImageUpload from './ImageUpload'

interface Props {
  initial?: Partial<NewsPost>
  onSave: (data: Partial<NewsPost>) => void
  saving?: boolean
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toSlug(text: string) {
  const ascii = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  if (!ascii) return `news-${Date.now()}`
  return ascii
}

export default function NewsForm({ initial = {}, onSave, saving }: Props) {
  const [title,      setTitle]      = useState(initial.title      ?? '')
  const [slug,       setSlug]       = useState(initial.slug       ?? '')
  const [content,    setContent]    = useState(initial.content    ?? '')
  const [newsType,   setNewsType]   = useState<'special' | 'janaza'>(initial.news_type ?? 'special')
  const [slugLocked, setSlugLocked] = useState(!!initial.slug)
  const [slugError,  setSlugError]  = useState('')
  const [image,       setImage]       = useState(initial.featured_image ?? '')
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(initial.published_at ?? new Date().toISOString()))
  const contentRef = useRef<HTMLTextAreaElement>(null)

  function insertMarkdown(before: string, after = '', placeholder = '') {
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const sel   = content.slice(start, end) || placeholder
    const next  = content.slice(0, start) + before + sel + after + content.slice(end)
    setContent(next)
    setTimeout(() => {
      ta.focus()
      const cur = start + before.length + sel.length
      ta.setSelectionRange(cur, cur)
    }, 0)
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugLocked) setSlug(toSlug(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleanSlug = slug.trim()
    if (!cleanSlug) {
      setSlugError('URL slug is required. Enter a short English slug (e.g. "ramadan-event-colombo").')
      return
    }
    if (/[^\w-]/.test(cleanSlug)) {
      setSlugError('Slug can only contain letters, numbers, and hyphens.')
      return
    }
    setSlugError('')
    onSave({
      title,
      slug: cleanSlug,
      content,
      news_type:      newsType,
      featured_image: image,
      published_at:   new Date(publishedAt).toISOString(),
    })
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#4a9e1f'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#0f172a' }}>News Content</h3>

            <div className="space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                  Title (Tamil) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ரமழான் சிறப்பு நிகழ்வு கொழும்பில் நடைபெறுகிறது"
                  className={inputClass}
                  style={{ ...inputStyle, fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: '1rem' }}
                  onFocus={focus} onBlur={blur}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                  URL Slug <span className="font-normal" style={{ color: '#94a3b8' }}>(for Sinhala/Tamil titles, edit this to an English slug)</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#94a3b8' }}>/news/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      readOnly={slugLocked}
                      className={inputClass}
                      style={{ ...inputStyle, paddingLeft: '52px', opacity: slugLocked ? 0.6 : 1 }}
                      onFocus={focus} onBlur={blur}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                    style={{ background: slugLocked ? '#f1f5f9' : '#fef9c3', color: slugLocked ? '#64748b' : '#a16207', border: '1px solid #e2e8f0' }}
                  >
                    {slugLocked ? '🔒 Locked' : '🔓 Editing'}
                  </button>
                </div>
                {slugError && <p className="text-xs mt-1.5 font-semibold" style={{ color: '#dc2626' }}>{slugError}</p>}
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                  Full Content (Tamil)
                </label>
                <div
                  className="flex flex-wrap gap-1 px-2 py-1.5 rounded-t-xl"
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderBottom: 'none' }}
                >
                  {[
                    { label: 'H2',  action: () => insertMarkdown('## ', '', 'Heading') },
                    { label: 'H3',  action: () => insertMarkdown('### ', '', 'Heading') },
                    { label: 'B',   action: () => insertMarkdown('**', '**', 'bold text'), bold: true },
                    { label: 'I',   action: () => insertMarkdown('*', '*', 'italic text'), italic: true },
                    { label: '""',  action: () => insertMarkdown('> ', '', 'quote') },
                    { label: '—',   action: () => insertMarkdown('\n\n---\n\n') },
                    { label: '• ',  action: () => insertMarkdown('- ', '', 'list item') },
                    { label: '1.',  action: () => insertMarkdown('1. ', '', 'list item') },
                    { label: '🔗',  action: () => insertMarkdown('[', '](url)', 'link text') },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={btn.action}
                      className="px-2 py-0.5 rounded text-xs transition-all"
                      style={{ background: 'white', color: '#475569', border: '1px solid #e2e8f0', fontWeight: btn.bold ? 700 : 400, fontStyle: btn.italic ? 'italic' : 'normal', minWidth: '28px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569' }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={contentRef}
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`செய்தியின் முழு உள்ளடக்கம்...\n\nSupports Markdown:\n## Heading  |  **bold**  |  *italic*\n> Blockquote  |  - bullet list  |  [link text](url)`}
                  className={inputClass}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Noto Sans Tamil', 'monospace', sans-serif", lineHeight: '1.8', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                  onFocus={focus} onBlur={blur}
                />
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — settings */}
        <div className="space-y-5">

          {/* Publish box */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#0f172a' }}>Publish</h3>

            {/* Publish date */}
            <div className="mb-5">
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                📅 Publish Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={inputClass}
                style={inputStyle}
                onFocus={focus} onBlur={blur}
              />
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                All listings order by this date. Defaults to now.
              </p>
            </div>

            {/* News type selector */}
            <div className="mb-5">
              <p className="text-xs font-bold mb-3" style={{ color: '#334155' }}>Post to Section <span style={{ color: '#dc2626' }}>*</span></p>
              <div className="space-y-2">
                {[
                  { value: 'special' as const, label: 'சிறப்புச் செய்திகள்', desc: 'Appears in the Special News section', color: '#1a3d1a' },
                  { value: 'janaza' as const,  label: 'Janaza News',          desc: 'Appears in the Janaza News section',  color: '#0369a1' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: newsType === opt.value ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${newsType === opt.value ? '#4a9e1f' : '#e2e8f0'}`,
                    }}
                  >
                    <input
                      type="radio"
                      name="news_type"
                      value={opt.value}
                      checked={newsType === opt.value}
                      onChange={() => setNewsType(opt.value)}
                      className="mt-0.5 accent-green-600"
                    />
                    <div>
                      <p className="text-xs font-bold" style={{ color: opt.color, fontFamily: opt.value === 'special' ? "'Noto Sans Tamil', sans-serif" : undefined }}>
                        {opt.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: saving ? '#94a3b8' : '#4a9e1f', boxShadow: saving ? 'none' : '0 2px 8px rgba(74,158,31,0.3)' }}
              >
                {saving ? 'Saving...' : initial.id ? '💾 Update Post' : '🚀 Publish Post'}
              </button>
              <Link
                href="/admin/news"
                className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all block"
                style={{ background: '#f1f5f9', color: '#64748b' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h3 className="text-sm font-extrabold mb-1" style={{ color: '#0f172a' }}>Featured Image</h3>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Optional. Cropping is optional — you can upload as-is.</p>
            <ImageUpload value={image} onChange={setImage} />
          </div>

        </div>
      </div>
    </form>
  )
}
