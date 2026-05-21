// Shared media library — persisted in localStorage until Supabase Storage is connected.

export interface StoredMediaItem {
  id: string
  name: string
  size: string
  dimensions: string
  uploaded: string
  dataUrl: string   // base64 data URL — real storage URL after Supabase is connected
}

const KEY = 'slmh_media_library'

export function getMediaItems(): StoredMediaItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveMediaItems(items: StoredMediaItem[]): void {
  // May throw QuotaExceededError — callers should catch when uploading large files
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function addMediaItem(item: StoredMediaItem): void {
  const items = getMediaItems()
  saveMediaItems([item, ...items])
}

export function removeMediaItems(ids: string[]): void {
  saveMediaItems(getMediaItems().filter((i) => !ids.includes(i.id)))
}

export function getMediaItemById(id: string): StoredMediaItem | undefined {
  return getMediaItems().find((i) => i.id === id)
}

/** Convert a File to a StoredMediaItem.
 *  If `storageUrl` is provided it is used as the dataUrl (Supabase Storage public URL).
 *  Otherwise the file is read as a base64 data URL (localStorage fallback). */
export function fileToMediaItem(file: File, storageUrl?: string): Promise<StoredMediaItem> {
  const sizeStr = file.size > 1024 * 1024
    ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(file.size / 1024)} KB`

  function buildItem(dataUrl: string, dimensions: string): StoredMediaItem {
    return {
      id:         `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:       file.name,
      size:       sizeStr,
      dimensions,
      uploaded:   new Date().toISOString().split('T')[0],
      dataUrl,
    }
  }

  // When we already have a public URL, still read dimensions locally (no quota cost)
  if (storageUrl) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(buildItem(storageUrl, `${img.naturalWidth} × ${img.naturalHeight}`))
      img.onerror = () => resolve(buildItem(storageUrl, '—'))
      img.src = storageUrl
    })
  }

  // Fallback: base64 in localStorage
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onload = () => resolve(buildItem(dataUrl, `${img.naturalWidth} × ${img.naturalHeight}`))
      img.onerror = () => resolve(buildItem(dataUrl, '—'))
      img.src = dataUrl
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
