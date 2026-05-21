export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export async function getCroppedBlob(
  imageSrc: string,
  cropArea: CropArea,
  mimeType = 'image/jpeg',
  quality = 0.92,
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width  = cropArea.width
  canvas.height = cropArea.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
    0, 0, cropArea.width, cropArea.height,
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      mimeType,
      quality,
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Do NOT set crossOrigin for object URLs (blob:) — it taints the canvas
    if (!src.startsWith('blob:')) img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
