// Shrinks an image client-side before it's uploaded to Supabase Storage, so a
// multi-megabyte phone photo doesn't eat into the (free-tier) storage quota
// for no visible benefit — nothing on the site displays images anywhere
// near their original camera resolution.

const MAX_DIMENSION = 1600 // px, longest side
const JPEG_QUALITY  = 0.82

export function resizeImageBlob(input: Blob, mimeHint?: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(input)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h)) // never upscale

      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const mime = mimeHint ?? input.type ?? 'image/jpeg'
      // PNG keeps transparency but doesn't support a quality setting — the
      // dimension cap above still does most of the size-saving work for it.
      const quality = mime === 'image/png' ? undefined : JPEG_QUALITY
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        mime,
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
    img.src = url
  })
}
