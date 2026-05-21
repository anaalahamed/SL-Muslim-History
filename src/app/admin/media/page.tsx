'use client'

import { useState, useRef, useEffect } from 'react'
import {
  StoredMediaItem,
  getMediaItems,
  addMediaItem,
  removeMediaItems,
  fileToMediaItem,
} from '@/lib/mediaStore'
import ImageCropModal from '@/components/ui/ImageCropModal'
import { supabase } from '@/lib/supabase'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export default function AdminMediaPage() {
  const [media,      setMedia]      = useState<StoredMediaItem[]>([])
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState<Set<string>>(new Set())
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [deleteBulk, setDeleteBulk] = useState(false)
  const [copied,     setCopied]     = useState<string | null>(null)
  const [dragging,   setDragging]   = useState(false)
  const [view,       setView]       = useState<'grid' | 'list'>('grid')
  const [uploading,  setUploading]  = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crop modal state
  const [cropSrc,      setCropSrc]      = useState<string | null>(null)
  const [cropFileName, setCropFileName] = useState<string>('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  useEffect(() => { setMedia(getMediaItems()) }, [])

  const filtered = media.filter((m) =>
    search.trim() === '' || m.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(filtered.length === selected.size && filtered.length > 0 ? new Set() : new Set(filtered.map((m) => m.id)))
  }

  function copyUrl(item: StoredMediaItem) {
    navigator.clipboard.writeText(item.dataUrl).catch(() => {})
    setCopied(item.id)
    setTimeout(() => setCopied(null), 2000)
  }

  function doDelete() {
    const ids = deleteBulk ? Array.from(selected) : deleteId ? [deleteId] : []
    removeMediaItems(ids)
    setMedia(getMediaItems())
    setSelected((prev) => { const n = new Set(prev); ids.forEach((id) => n.delete(id)); return n })
    setDeleteId(null)
    setDeleteBulk(false)
  }

  // Step 1: file selected → open crop modal for first file
  function processFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError(null)

    const arr = Array.from(files)
    const oversized = arr.filter((f) => f.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      setUploadError(`File${oversized.length > 1 ? 's' : ''} too large: ${oversized.map((f) => f.name).join(', ')}. Max 25 MB per file.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Open crop modal for the first file; queue the rest
    const [first, ...rest] = arr
    setPendingFiles(rest)
    setCropFileName(first.name)
    setCropSrc(URL.createObjectURL(first))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Step 2: crop confirmed → upload the cropped blob, then move to next file
  async function handleCropDone(blob: Blob, fileName: string) {
    setCropSrc(null)
    setUploading(true)
    const errors: string[] = []

    try {
      const croppedFile = new File([blob], fileName, { type: blob.type })
      if (supabase) {
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${Date.now()}-${safeName}`
        const { data, error } = await supabase.storage.from('media').upload(path, croppedFile, { upsert: false })
        if (error) {
          errors.push(`${fileName}: ${error.message}`)
        } else {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
          const item = await fileToMediaItem(croppedFile, publicUrl)
          addMediaItem(item)
        }
      } else {
        const item = await fileToMediaItem(croppedFile)
        try { addMediaItem(item) } catch {
          errors.push(`${fileName}: browser storage full`)
        }
      }
    } catch (err) {
      errors.push(`${fileName}: ${err instanceof Error ? err.message : 'unknown error'}`)
    }

    setMedia(getMediaItems())
    if (errors.length > 0) setUploadError(errors.join(' | '))
    setUploading(false)

    // If more files queued, open crop for next one
    if (pendingFiles.length > 0) {
      const [next, ...rest] = pendingFiles
      setPendingFiles(rest)
      setCropFileName(next.name)
      setCropSrc(URL.createObjectURL(next))
    }
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPendingFiles([])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const totalSizeKb = media.reduce((acc, m) => {
    const n = parseFloat(m.size)
    return acc + (m.size.includes('MB') ? n * 1024 : n)
  }, 0)
  const totalSizeStr = totalSizeKb > 1024 ? `${(totalSizeKb / 1024).toFixed(1)} MB` : `${Math.round(totalSizeKb)} KB`

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Media Library</h2>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
            {media.length} files · {totalSizeStr} used
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: uploading ? '#94a3b8' : '#4a9e1f', boxShadow: uploading ? 'none' : '0 2px 8px rgba(74,158,31,0.3)' }}
          onMouseEnter={(e) => { if (!uploading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(74,158,31,0.4)' } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = uploading ? 'none' : '0 2px 8px rgba(74,158,31,0.3)' }}
        >
          {uploading ? '⏳ Uploading...' : '↑ Upload Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* Upload zone */}
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer"
        style={{
          border: `2px dashed ${dragging ? '#4a9e1f' : '#e2e8f0'}`,
          background: dragging ? '#f0fdf4' : '#f8fafc',
          minHeight: '140px',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.background = '#f0fdf4' }}
        onMouseLeave={(e) => { if (!dragging) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' } }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: dragging || uploading ? '#dcfce7' : 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          {uploading ? '⏳' : '🖼️'}
        </div>
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: dragging || uploading ? '#4a9e1f' : '#475569' }}>
            {uploading ? 'Processing images...' : dragging ? 'Drop files here' : 'Drag & drop images here'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
            or click to browse · JPG, PNG, WebP · Max 25 MB per file
          </p>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-lg"
          style={{ background: '#f1f5f9', color: '#94a3b8' }}
        >
          {supabase ? 'Uploaded to Supabase Storage' : 'Saved in browser (connect Supabase for larger files)'}
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          <span>⚠️</span>
          <span className="flex-1">{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-xs font-black opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div
        className="rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        style={{ background: 'white', border: '1px solid #e2e8f0' }}
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
        <button
          onClick={selectAll}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc' }}
        >
          {selected.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
        </button>
        {selected.size > 0 && (
          <button
            onClick={() => setDeleteBulk(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
          >
            🗑️ Delete {selected.size} selected
          </button>
        )}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-2 text-xs font-bold transition-all"
              style={{ background: view === v ? '#4a9e1f' : '#f8fafc', color: view === v ? 'white' : '#64748b' }}
            >
              {v === 'grid' ? '⊞' : '≡'}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold px-2" style={{ color: '#94a3b8' }}>
          {filtered.length} file{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {media.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="font-semibold" style={{ color: '#64748b' }}>No images yet</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Upload your first image using the zone above.</p>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const isSelected = selected.has(item.id)
            return (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden transition-all cursor-pointer"
                style={{
                  background: 'white',
                  border: `2px solid ${isSelected ? '#4a9e1f' : '#e2e8f0'}`,
                  boxShadow: isSelected ? '0 0 0 3px rgba(74,158,31,0.15)' : 'none',
                }}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="h-32 relative overflow-hidden" style={{ background: '#f1f5f9' }}>
                  <img
                    src={item.dataUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: '#4a9e1f' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold truncate" style={{ color: '#1e293b' }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{item.size} · {item.dimensions}</p>
                  <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => copyUrl(item)}
                      className="flex-1 py-1 rounded-lg text-xs font-bold transition-all"
                      style={{ background: copied === item.id ? '#f0fdf4' : '#f1f5f9', color: copied === item.id ? '#4a9e1f' : '#475569' }}
                    >
                      {copied === item.id ? '✓ Copied' : 'Copy URL'}
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="px-2 py-1 rounded-lg text-xs transition-all"
                      style={{ background: '#fef2f2', color: '#dc2626' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <div
            className="grid gap-4 px-5 py-3 text-xs font-black uppercase tracking-wider"
            style={{ gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr auto', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', color: '#94a3b8' }}
          >
            <span></span><span>File</span><span>Dimensions</span><span>Size</span><span>Uploaded</span><span>Actions</span>
          </div>
          {filtered.map((item, i) => {
            const isSelected = selected.has(item.id)
            return (
              <div
                key={item.id}
                className="grid gap-4 px-5 py-3 items-center transition-colors cursor-pointer"
                style={{
                  gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr auto',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                  background: isSelected ? '#f0fdf4' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                onClick={() => toggleSelect(item.id)}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{ border: `2px solid ${isSelected ? '#4a9e1f' : '#cbd5e1'}`, background: isSelected ? '#4a9e1f' : 'white' }}
                >
                  {isSelected && <span className="text-white text-xs font-black leading-none">✓</span>}
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.dataUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{item.name}</p>
                </div>
                <span className="text-xs" style={{ color: '#64748b' }}>{item.dimensions}</span>
                <span className="text-xs" style={{ color: '#64748b' }}>{item.size}</span>
                <span className="text-xs" style={{ color: '#94a3b8' }}>{item.uploaded}</span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => copyUrl(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: copied === item.id ? '#f0fdf4' : '#f1f5f9', color: copied === item.id ? '#4a9e1f' : '#475569' }}
                  >
                    {copied === item.id ? '✓ Copied' : 'Copy URL'}
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: '#fef2f2', color: '#dc2626' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && media.length > 0 && (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-semibold" style={{ color: '#64748b' }}>No files match your search</p>
        </div>
      )}

      {/* Crop modal */}
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          fileName={cropFileName}
          onDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}

      {/* Delete modal */}
      {(deleteId || deleteBulk) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h3 className="text-base font-extrabold text-center mb-2" style={{ color: '#0f172a' }}>
              {deleteBulk ? `Delete ${selected.size} Files?` : 'Delete File?'}
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteId(null); setDeleteBulk(false) }}
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
