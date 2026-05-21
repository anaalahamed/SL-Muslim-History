'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ImageCropModal from '@/components/ui/ImageCropModal'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function ImageUpload({ value, onChange }: Props) {
  const [tab,       setTab]       = useState<'upload' | 'url'>('upload')
  const [urlInput,  setUrlInput]  = useState(value.startsWith('http') ? value : '')
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [cropSrc,   setCropSrc]   = useState<string | null>(null)
  const [cropName,  setCropName]  = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // File selected → open crop modal
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setCropName(file.name)
    setCropSrc(URL.createObjectURL(file))
    if (fileRef.current) fileRef.current.value = ''
  }

  // Crop confirmed → upload blob to Supabase
  async function handleCropDone(blob: Blob, fileName: string) {
    setCropSrc(null)
    setUploading(true)
    setError(null)
    try {
      if (supabase) {
        const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${Date.now()}-${safe}`
        const file = new File([blob], safe, { type: blob.type })
        const { data, error: upErr } = await supabase.storage.from('media').upload(path, file, { upsert: false })
        if (upErr) { setError(upErr.message); return }
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
        onChange(publicUrl)
      } else {
        // Fallback: use object URL (won't persist after reload, but works for demo)
        const url = URL.createObjectURL(blob)
        onChange(url)
        setError('Supabase not connected — image URL is temporary.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleCropCancel() {
    // Only revoke if it's a local object URL, not a remote http URL
    if (cropSrc?.startsWith('blob:')) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  // Re-open crop modal with the already-set image
  function handleEdit() {
    if (!value) return
    setError(null)
    const name = value.split('/').pop()?.split('?')[0] ?? 'image.jpg'
    setCropName(name)
    setCropSrc(value)
  }

  function handleUrlApply() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onChange(trimmed)
  }

  return (
    <div className="space-y-3">

      {/* Current image preview — 16:9 box so admin sees exactly what users see */}
      {value && (
        <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#e2e8f0' }}>
          <img
            src={value}
            alt="Featured"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Edit button */}
          <button
            type="button"
            onClick={handleEdit}
            className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"
            style={{ background: 'rgba(74,158,31,0.9)' }}
          >
            ✏️ Edit
          </button>
          {/* Remove button */}
          <button
            type="button"
            onClick={() => { onChange(''); setUrlInput('') }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
            style={{ background: 'rgba(220,38,38,0.85)' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
        {(['upload', 'url'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-bold transition-all"
            style={{
              background: tab === t ? '#4a9e1f' : '#f8fafc',
              color:      tab === t ? 'white'    : '#64748b',
            }}
          >
            {t === 'upload' ? '📁 Upload from Computer' : '🔗 Paste URL'}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          <div
            className="h-24 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
            style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}
            onClick={() => fileRef.current?.click()}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.background = '#f0fdf4' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
          >
            {uploading ? (
              <><span className="text-xl">⏳</span><span className="text-xs font-semibold" style={{ color: '#64748b' }}>Uploading...</span></>
            ) : (
              <><span className="text-xl">🖼️</span><span className="text-xs font-semibold" style={{ color: '#475569' }}>Click to choose an image</span>
              <span className="text-xs" style={{ color: '#94a3b8' }}>JPG, PNG, WebP — you can crop before uploading</span></>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlApply() } }}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
            style={{ background: '#4a9e1f' }}
          >
            Apply
          </button>
        </div>
      )}

      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}

      {/* Crop modal */}
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          fileName={cropName}
          onDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
