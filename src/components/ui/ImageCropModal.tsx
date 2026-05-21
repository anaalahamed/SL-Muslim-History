'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// ── helpers ──────────────────────────────────────────────────────────────────
function centered(w: number, h: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, w, h),
    w, h,
  )
}

function drawPreview(
  img: HTMLImageElement,
  px:  PixelCrop,
  canvas: HTMLCanvasElement,
) {
  const scaleX = img.naturalWidth  / img.width
  const scaleY = img.naturalHeight / img.height
  const ctx    = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(
    img,
    px.x * scaleX, px.y * scaleY, px.width * scaleX, px.height * scaleY,
    0, 0, canvas.width, canvas.height,
  )
}

// ── types ─────────────────────────────────────────────────────────────────────
const RATIOS = [
  { label: '16:9', sub: 'Articles & home',  value: 16 / 9 },
  { label: '4:3',  sub: 'News posts',        value: 4  / 3 },
]

interface Props {
  imageSrc: string
  fileName: string
  onDone:   (blob: Blob, fileName: string) => void
  onCancel: () => void
}

// ── component ─────────────────────────────────────────────────────────────────
export default function ImageCropModal({ imageSrc, fileName, onDone, onCancel }: Props) {
  const imgRef     = useRef<HTMLImageElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  const [crop,       setCrop]       = useState<Crop>()
  const [pixelCrop,  setPixelCrop]  = useState<PixelCrop>()
  const [ratio,      setRatio]      = useState(16 / 9)
  const [processing, setProcessing] = useState(false)
  const [imgReady,   setImgReady]   = useState(false)

  // Set initial crop once image is loaded
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(centered(w, h, ratio))
    setImgReady(true)
  }

  // Change ratio → reset crop to a centred selection
  function handleRatio(r: number) {
    setRatio(r)
    if (imgRef.current) {
      const { naturalWidth: w, naturalHeight: h } = imgRef.current
      setCrop(centered(w, h, r))
      setPixelCrop(undefined)
    }
  }

  // Draw live preview whenever pixel crop changes
  useEffect(() => {
    if (!pixelCrop || !imgRef.current || !previewRef.current) return
    // Set canvas aspect ratio to match the selected ratio
    const canvas = previewRef.current
    const aspect = ratio
    canvas.width  = 240
    canvas.height = Math.round(240 / aspect)
    drawPreview(imgRef.current, pixelCrop, canvas)
  }, [pixelCrop, ratio])

  // ── confirm ────────────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!pixelCrop || !imgRef.current) return
    setProcessing(true)
    try {
      const img    = imgRef.current
      const scaleX = img.naturalWidth  / img.width
      const scaleY = img.naturalHeight / img.height

      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(pixelCrop.width  * scaleX)
      canvas.height = Math.round(pixelCrop.height * scaleY)

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        img,
        Math.round(pixelCrop.x      * scaleX),
        Math.round(pixelCrop.y      * scaleY),
        Math.round(pixelCrop.width  * scaleX),
        Math.round(pixelCrop.height * scaleY),
        0, 0, canvas.width, canvas.height,
      )

      const ext  = fileName.split('.').pop()?.toLowerCase() ?? 'jpg'
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), mime, 0.92)
      )
      onDone(blob, fileName)
    } catch (err) {
      console.error('Crop error:', err)
      setProcessing(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl flex flex-col"
        style={{ background: 'white', maxHeight: '95vh' }}
      >

        {/* ── Header ── */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <div>
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Crop Image</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Drag the handles to set the crop area · Preview updates live
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ background: '#f1f5f9', color: '#64748b' }}
          >×</button>
        </div>

        {/* ── Ratio selector ── */}
        <div
          className="px-5 py-3 flex items-center gap-3 flex-shrink-0 flex-wrap"
          style={{ borderBottom: '1px solid #f1f5f9' }}
        >
          <span className="text-xs font-bold" style={{ color: '#64748b' }}>Crop for:</span>
          {RATIOS.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => handleRatio(r.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: ratio === r.value ? '#4a9e1f' : '#f1f5f9',
                color:      ratio === r.value ? 'white'   : '#64748b',
                border:     ratio === r.value ? '1.5px solid #3d8a18' : '1.5px solid #e2e8f0',
              }}
            >
              <span className="font-black">{r.label}</span>
              <span className="opacity-70">{r.sub}</span>
            </button>
          ))}
        </div>

        {/* ── Main area: crop + preview ── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

          {/* Crop canvas */}
          <div
            className="flex-1 flex items-center justify-center overflow-auto p-4"
            style={{ background: '#0f172a', minHeight: '300px' }}
          >
            <ReactCrop
              crop={crop}
              onChange={(_, pct) => setCrop(pct)}
              onComplete={(px)   => setPixelCrop(px)}
              aspect={ratio}
              minWidth={40}
              minHeight={40}
              style={{ maxWidth: '100%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="crop source"
                onLoad={onImageLoad}
                crossOrigin={imageSrc.startsWith('blob:') ? undefined : 'anonymous'}
                draggable={false}
                style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }}
              />
            </ReactCrop>
          </div>

          {/* Live preview panel */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center gap-3 p-4"
            style={{ width: '200px', background: '#f8fafc', borderLeft: '1px solid #e2e8f0' }}
          >
            <p className="text-xs font-bold" style={{ color: '#64748b' }}>Live Preview</p>
            {pixelCrop ? (
              <canvas
                ref={previewRef}
                style={{
                  width:     '160px',
                  height:    `${Math.round(160 / ratio)}px`,
                  borderRadius: '8px',
                  border:    '2px solid #e2e8f0',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center text-center text-xs rounded-xl"
                style={{
                  width:     '160px',
                  height:    `${Math.round(160 / ratio)}px`,
                  background: '#e2e8f0',
                  color:     '#94a3b8',
                  border:    '2px dashed #cbd5e1',
                }}
              >
                {imgReady ? 'Adjust crop to\nsee preview' : 'Loading…'}
              </div>
            )}
            <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
              {ratio === 16 / 9 ? '16:9 — articles' : '4:3 — news'}
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: '1px solid #e2e8f0' }}
        >
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            {pixelCrop
              ? `${Math.round(pixelCrop.width)} × ${Math.round(pixelCrop.height)} px selected`
              : 'Drag the crop area to adjust'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#f1f5f9', color: '#475569' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing || !pixelCrop}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background:  processing || !pixelCrop ? '#94a3b8' : '#4a9e1f',
                boxShadow:   processing || !pixelCrop ? 'none' : '0 2px 8px rgba(74,158,31,0.3)',
              }}
            >
              {processing ? 'Saving…' : '✓ Confirm Crop'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
