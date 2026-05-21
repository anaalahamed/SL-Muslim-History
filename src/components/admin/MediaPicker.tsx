'use client'

import { useState, useEffect, useRef } from 'react'
import { StoredMediaItem, getMediaItems, addMediaItem, fileToMediaItem } from '@/lib/mediaStore'
import { supabase } from '@/lib/supabase'

interface Props {
  onSelect: (dataUrl: string, id: string) => void
  onClose: () => void
}

export default function MediaPicker({ onSelect, onClose }: Props) {
  const [items,       setItems]       = useState<StoredMediaItem[]>([])
  const [selected,    setSelected]    = useState<string | null>(null)
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [search,      setSearch]      = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setItems(getMediaItems()) }, [])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError(null)
    const firstNewId: string[] = []

    for (const file of Array.from(files)) {
      try {
        let storageUrl: string | undefined

        if (supabase) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const path = `${Date.now()}-${safeName}`
          const { data, error } = await supabase.storage.from('media').upload(path, file, { upsert: false })
          if (error) {
            setUploadError(`Upload failed: ${error.message}`)
            continue
          }
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
          storageUrl = publicUrl
        }

        const item = await fileToMediaItem(file, storageUrl)
        addMediaItem(item)
        if (firstNewId.length === 0) firstNewId.push(item.id)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed — browser storage may be full. Connect Supabase Storage to fix this.')
      }
    }

    const updated = getMediaItems()
    setItems(updated)
    if (firstNewId.length > 0) setSelected(firstNewId[0])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function confirm() {
    const item = items.find((m) => m.id === selected)
    if (item) onSelect(item.dataUrl, item.id)
  }

  const filtered = items.filter((m) =>
    search.trim() === '' || m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <div>
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Media Library</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{items.length} image{items.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: uploading ? '#94a3b8' : '#4a9e1f' }}
            >
              {uploading ? '⏳ Uploading...' : '↑ Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all"
              style={{ color: '#94a3b8', background: '#f1f5f9' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl flex items-start gap-2 text-xs font-semibold" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            <span className="mt-0.5">⚠️</span>
            <span className="flex-1">{uploadError}</span>
            <button type="button" onClick={() => setUploadError(null)} className="font-black opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Search */}
        {items.length > 0 && (
          <div className="px-4 pt-3">
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0' }}
            />
          </div>
        )}

        {/* Grid / Empty state */}
        <div className="p-4 overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 rounded-2xl cursor-pointer transition-all"
              style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.background = '#f0fdf4' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
            >
              <span className="text-4xl mb-3">🖼️</span>
              <p className="text-sm font-bold" style={{ color: '#475569' }}>No images in library</p>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Click here or use the Upload button to add images</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: '#94a3b8' }}>No images match your search</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const isSelected = selected === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : item.id)}
                    className="rounded-xl overflow-hidden text-left transition-all"
                    style={{
                      border: `2px solid ${isSelected ? '#4a9e1f' : '#e2e8f0'}`,
                      boxShadow: isSelected ? '0 0 0 3px rgba(74,158,31,0.2)' : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <div className="h-24 relative overflow-hidden" style={{ background: '#f1f5f9' }}>
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {isSelected && (
                        <div
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                          style={{ background: '#4a9e1f' }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-1.5" style={{ background: 'white' }}>
                      <p className="text-xs font-semibold truncate" style={{ color: '#1e293b' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{item.dimensions}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            {selected ? `Selected: ${items.find((m) => m.id === selected)?.name}` : 'No image selected'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: '#f1f5f9', color: '#64748b' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!selected}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: selected ? '#4a9e1f' : '#94a3b8', boxShadow: selected ? '0 2px 8px rgba(74,158,31,0.3)' : 'none' }}
            >
              Use This Image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
