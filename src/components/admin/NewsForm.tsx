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

const NEWS_CATEGORIES = ['Community', 'Heritage', 'Education', 'Literature', 'Events', 'General']

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
  const [excerpt,    setExcerpt]    = useState(initial.excerpt    ?? '')
  const [content,    setContent]    = useState(initial.content    ?? '')
  const [category,   setCategory]   = useState(initial.category   ?? '')
  const [isBreaking,  setIsBreaking]  = useState(initial.is_breaking ?? false)
  const [slugLocked,  setSlugLocked]  = useState(!!initial.slug)
  const [image, setImage] = useState(initial.featured_image ?? '')
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

  const [slugError, setSlugError] = useState('')

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
      excerpt,
      content,
      category,
      is_breaking:    isBreaking,
      featured_image: image,
      published_at:   initial.published_at ?? new Date().toISOString(),
    })
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#4a9e1f'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-5">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
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
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: '#94a3b8' }}
                    >
                      /news/
                    </span>
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
                {slugError && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: '#dc2626' }}>{slugError}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                  Excerpt (Tamil) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="செய்தியின் சுருக்கமான விளக்கம்..."
                  className={inputClass}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Noto Sans Tamil', sans-serif" }}
                  onFocus={focus} onBlur={blur}
                />
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{excerpt.length} characters</p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                  Full Content (Tamil)
                </label>
                {/* Markdown toolbar */}
                <div
                  className="flex flex-wrap gap-1 px-2 py-1.5 rounded-t-xl"
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderBottom: 'none' }}
                >
                  {[
                    { label: 'H2',  title: 'Heading 2',    action: () => insertMarkdown('## ', '', 'Heading') },
                    { label: 'H3',  title: 'Heading 3',    action: () => insertMarkdown('### ', '', 'Heading') },
                    { label: 'B',   title: 'Bold',          action: () => insertMarkdown('**', '**', 'bold text'), bold: true },
                    { label: 'I',   title: 'Italic',        action: () => insertMarkdown('*', '*', 'italic text'), italic: true },
                    { label: '""',  title: 'Blockquote',    action: () => insertMarkdown('> ', '', 'quote') },
                    { label: '—',   title: 'Divider',       action: () => insertMarkdown('\n\n---\n\n') },
                    { label: '• ',  title: 'Bullet list',   action: () => insertMarkdown('- ', '', 'list item') },
                    { label: '1.',  title: 'Numbered list', action: () => insertMarkdown('1. ', '', 'list item') },
                    { label: '🔗',  title: 'Link',          action: () => insertMarkdown('[', '](url)', 'link text') },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      title={btn.title}
                      onClick={btn.action}
                      className="px-2 py-0.5 rounded text-xs transition-all"
                      style={{
                        background: 'white',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        fontWeight: btn.bold ? 700 : 400,
                        fontStyle: btn.italic ? 'italic' : 'normal',
                        minWidth: '28px',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#4a9e1f' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0' }}
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
                  {content.split(/\s+/).filter(Boolean).length} words · Supports Markdown: **bold**, *italic*, ## heading, &gt; quote, - list
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — settings */}
        <div className="space-y-5">

          {/* Publish box */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#0f172a' }}>Publish</h3>

            {/* Breaking toggle */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>Breaking News</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Show in breaking news ticker</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBreaking(!isBreaking)}
                className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: isBreaking ? '#dc2626' : '#e2e8f0' }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: isBreaking ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                />
              </button>
            </div>

            {isBreaking && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-xs font-semibold"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
              >
                🔴 Will appear in the breaking news ticker
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: saving ? '#94a3b8' : '#4a9e1f',
                  boxShadow: saving ? 'none' : '0 2px 8px rgba(74,158,31,0.3)',
                }}
              >
                {saving ? 'Saving...' : initial.id ? '💾 Update Post' : '🚀 Publish Post'}
              </button>
              <Link
                href="/admin/news"
                className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all"
                style={{ background: '#f1f5f9', color: '#64748b' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Category */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#0f172a' }}>Category</h3>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              style={inputStyle}
              onFocus={focus} onBlur={blur}
            >
              <option value="">Select a category</option>
              {NEWS_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <h3 className="text-sm font-extrabold mb-4" style={{ color: '#0f172a' }}>Featured Image</h3>
            <ImageUpload value={image} onChange={setImage} />
          </div>

        </div>
      </div>
    </form>
  )
}
