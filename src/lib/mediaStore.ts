// Shared media library — the list is read directly from the Supabase
// Storage 'media' bucket (the actual source of truth for uploaded files),
// instead of a separate index kept in the browser's localStorage. That old
// index only ever existed on whichever device did the upload, so photos
// uploaded on one device silently never showed up in the picker on another.

import { getAuthClient } from './supabase-auth'

export interface StoredMediaItem {
  id: string      // storage path — also what's passed to removeMediaItems
  name: string
  size: string     // formatted, e.g. "128 KB"
  uploaded: string // YYYY-MM-DD
  dataUrl: string  // public Supabase Storage URL
}

function formatSize(bytes: number): string {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`
}

export async function getMediaItems(): Promise<StoredMediaItem[]> {
  const client = getAuthClient()
  const { data, error } = await client.storage.from('media').list('', {
    limit: 1000,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error || !data) return []
  return data
    .filter((f) => f.id !== null) // skip subfolders, if any
    .map((f) => ({
      id:       f.name,
      name:     f.name,
      size:     formatSize(f.metadata?.size ?? 0),
      uploaded: (f.created_at ?? '').split('T')[0],
      dataUrl:  client.storage.from('media').getPublicUrl(f.name).data.publicUrl,
    }))
}

export async function removeMediaItems(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  await getAuthClient().storage.from('media').remove(paths)
}

/** Uploads a file to the shared media bucket and returns its library entry. */
export async function uploadMediaFile(file: File): Promise<StoredMediaItem> {
  const client = getAuthClient()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${Date.now()}-${safeName}`
  const { data, error } = await client.storage.from('media').upload(path, file, { upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = client.storage.from('media').getPublicUrl(data.path)
  return {
    id:       data.path,
    name:     file.name,
    size:     formatSize(file.size),
    uploaded: new Date().toISOString().split('T')[0],
    dataUrl:  publicUrl,
  }
}
