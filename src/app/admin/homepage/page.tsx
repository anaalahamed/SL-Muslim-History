'use client'

import { useState, useEffect, useRef } from 'react'
import { getAdminConfig, saveAdminConfig, defaultConfig, AdminConfig } from '@/lib/adminConfig'
import { getArticles } from '@/lib/db/articles'
import { Article } from '@/lib/types'
import MediaPicker from '@/components/admin/MediaPicker'
import { fileToMediaItem, addMediaItem, getMediaItemById } from '@/lib/mediaStore'
import { supabase } from '@/lib/supabase'

const MAX_FEATURED = 3

export default function AdminHomepagePage() {
  const [config,       setConfig]       = useState<AdminConfig>(defaultConfig)
  const [saved,        setSaved]        = useState(false)
  const [search,       setSearch]       = useState('')
  const [showPicker,   setShowPicker]   = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
  const directUploadRef = useRef<HTMLInputElement>(null)

  const [allArticles, setAllArticles] = useState<Article[]>([])

  useEffect(() => {
    setConfig(getAdminConfig())
    getArticles().then(setAllArticles)
  }, [])

  const filtered = allArticles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  function toggleFeatured(id: string) {
    const ids = config.featuredArticleIds
    if (ids.includes(id)) {
      setConfig({ ...config, featuredArticleIds: ids.filter((i) => i !== id) })
    } else if (ids.length < MAX_FEATURED) {
      setConfig({ ...config, featuredArticleIds: [...ids, id] })
    }
  }

  function setHero(id: string) {
    setConfig({ ...config, heroArticleId: config.heroArticleId === id ? '' : id })
  }

  function handleSave() {
    saveAdminConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleDirectUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setImgUploading(true)
    const file = files[0]
    let storageUrl: string | undefined

    if (supabase) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${Date.now()}-${safeName}`
      const { data, error } = await supabase.storage.from('media').upload(path, file, { upsert: false })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
        storageUrl = publicUrl
      }
    }

    const item = await fileToMediaItem(file, storageUrl)
    addMediaItem(item)
    setConfig((c) => ({ ...c, heroBannerImage: item.id }))
    setImgUploading(false)
    if (directUploadRef.current) directUploadRef.current.value = ''
  }

  // Resolve item ID → data URL for preview
  const heroBannerImageUrl = config.heroBannerImage
    ? getMediaItemById(config.heroBannerImage)?.dataUrl ?? ''
    : ''

  const heroArticle     = allArticles.find((a) => a.id === config.heroArticleId)
  const featuredArticles = config.featuredArticleIds
    .map((id) => allArticles.find((a) => a.id === id))
    .filter(Boolean) as Article[]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Homepage Control</h2>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
            Pin articles to the hero banner and featured section.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#4a9e1f' }}>
              ✅ Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Hero Banner Image */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#c9a84c' }} />
          <div>
            <h3 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>Hero Banner Image</h3>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              The large image shown in the hero section. If not set, uses the article&apos;s own image.
            </p>
          </div>
        </div>
        <div className="p-5">
          <input
            ref={directUploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleDirectUpload(e.target.files)}
          />

          {config.heroBannerImage ? (
            <div className="flex items-center gap-4">
              <div
                className="w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                {heroBannerImageUrl && (
                  <img
                    src={heroBannerImageUrl}
                    alt="Hero banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                  {config.heroBannerImage.split('/').pop()}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{config.heroBannerImage}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => directUploadRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: '#f1f5f9', color: '#475569' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
                  >
                    ↑ Upload New
                  </button>
                  <button
                    onClick={() => setShowPicker(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: '#f1f5f9', color: '#475569' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
                  >
                    🖼️ From Library
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, heroBannerImage: '' })}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: '#fef2f2', color: '#dc2626' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Direct upload */}
              <button
                onClick={() => directUploadRef.current?.click()}
                disabled={imgUploading}
                className="flex flex-col items-center justify-center py-6 rounded-xl transition-all"
                style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.background = '#f0fdf4' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
              >
                <span className="text-2xl mb-1.5">{imgUploading ? '⏳' : '↑'}</span>
                <span className="text-sm font-bold" style={{ color: '#475569' }}>
                  {imgUploading ? 'Uploading...' : 'Upload from device'}
                </span>
                <span className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>JPG, PNG, WebP</span>
              </button>
              {/* Pick from library */}
              <button
                onClick={() => setShowPicker(true)}
                className="flex flex-col items-center justify-center py-6 rounded-xl transition-all"
                style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.background = '#f0fdf4' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
              >
                <span className="text-2xl mb-1.5">🖼️</span>
                <span className="text-sm font-bold" style={{ color: '#475569' }}>Choose from library</span>
                <span className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Pick an existing image</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current selection preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Hero preview */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#4a9e1f' }} />
            <div>
              <h3 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>Hero Banner</h3>
              <p className="text-xs" style={{ color: '#94a3b8' }}>1 article — shown in the large hero section</p>
            </div>
          </div>
          <div className="p-5">
            {heroArticle ? (
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#f0fdf4' }}
                >
                  📜
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold line-clamp-2 leading-snug" style={{ color: '#0f172a', fontFamily: "'Noto Sans Tamil', sans-serif" }}>
                    {heroArticle.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#4a9e1f' }}>{heroArticle.category}</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, heroArticleId: '' })}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                  style={{ background: '#fef2f2', color: '#dc2626' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-6 rounded-xl text-center"
                style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}
              >
                <span className="text-2xl mb-1">🖼️</span>
                <p className="text-xs font-semibold" style={{ color: '#94a3b8' }}>No article pinned</p>
                <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>Latest article will show by default</p>
              </div>
            )}
          </div>
        </div>

        {/* Featured preview */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#c9a84c' }} />
              <div>
                <h3 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>Featured Articles</h3>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Up to 3 — shown in the featured section</p>
              </div>
            </div>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: config.featuredArticleIds.length >= MAX_FEATURED ? '#fef2f2' : '#f0fdf4', color: config.featuredArticleIds.length >= MAX_FEATURED ? '#dc2626' : '#15803d' }}
            >
              {config.featuredArticleIds.length}/{MAX_FEATURED}
            </span>
          </div>
          <div className="p-5 space-y-3">
            {featuredArticles.length > 0 ? featuredArticles.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                  style={{ background: '#4a9e1f' }}
                >
                  {i + 1}
                </span>
                <p className="flex-1 text-xs font-semibold line-clamp-1" style={{ color: '#0f172a', fontFamily: "'Noto Sans Tamil', sans-serif" }}>
                  {a.title}
                </p>
                <button
                  onClick={() => toggleFeatured(a.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all"
                  style={{ background: '#fef2f2', color: '#dc2626' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                >
                  ✕
                </button>
              </div>
            )) : (
              <div
                className="flex flex-col items-center justify-center py-6 rounded-xl text-center"
                style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}
              >
                <span className="text-2xl mb-1">📌</span>
                <p className="text-xs font-semibold" style={{ color: '#94a3b8' }}>No articles pinned</p>
                <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>Latest articles will show by default</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPicker && (
        <MediaPicker
          onSelect={(_dataUrl, id) => { setConfig({ ...config, heroBannerImage: id }); setShowPicker(false) }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Article picker */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <div>
            <h3 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>All Articles</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Click to assign to hero or featured section</p>
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', width: '220px' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
          {filtered.map((article) => {
            const isHero     = config.heroArticleId === article.id
            const isFeatured = config.featuredArticleIds.includes(article.id)
            const featuredFull = config.featuredArticleIds.length >= MAX_FEATURED && !isFeatured

            return (
              <div
                key={article.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{ background: isHero ? '#f0fdf4' : isFeatured ? '#fffbeb' : 'white' }}
              >
                {/* Status badges */}
                <div className="flex gap-1.5 flex-shrink-0 w-20">
                  {isHero && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: '#4a9e1f', color: 'white' }}>
                      Hero
                    </span>
                  )}
                  {isFeatured && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: '#c9a84c', color: 'white' }}>
                      #{config.featuredArticleIds.indexOf(article.id) + 1}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1" style={{ color: '#0f172a', fontFamily: "'Noto Sans Tamil', sans-serif" }}>
                    {article.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{article.category}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setHero(article.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: isHero ? '#4a9e1f' : '#f1f5f9',
                      color:      isHero ? 'white'   : '#475569',
                    }}
                    onMouseEnter={(e) => { if (!isHero) { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' } }}
                    onMouseLeave={(e) => { if (!isHero) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' } }}
                  >
                    {isHero ? '✓ Hero' : 'Set Hero'}
                  </button>
                  <button
                    onClick={() => toggleFeatured(article.id)}
                    disabled={featuredFull}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: isFeatured ? '#c9a84c' : featuredFull ? '#f1f5f9' : '#f1f5f9',
                      color:      isFeatured ? 'white'   : featuredFull ? '#cbd5e1' : '#475569',
                      cursor:     featuredFull ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => { if (!isFeatured && !featuredFull) { e.currentTarget.style.background = '#c9a84c'; e.currentTarget.style.color = 'white' } }}
                    onMouseLeave={(e) => { if (!isFeatured && !featuredFull) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' } }}
                  >
                    {isFeatured ? '✓ Featured' : 'Feature'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
