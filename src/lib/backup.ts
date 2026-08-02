import type { SupabaseClient } from '@supabase/supabase-js'

// Every table that holds real site content — kept in one place so a new
// table added later just needs adding here to be covered by backups too.
// Media files aren't a table — they live in Supabase Storage, and are
// backed up separately below via the storage list API.
export const BACKUP_TABLES = [
  'articles',
  'news',
  'categories',
  'authors',
  'comments',
  'comment_blocks',
  'reactions',
  'advertisements',
  'contact_messages',
  'newsletter_subscribers',
  'site_settings',
] as const

export interface BackupResult {
  countsByTable: Record<string, number>
  failedTables: string[]
  filename: string
}

// Fetches every row from every table above and downloads it as one JSON
// file — a full, restorable snapshot of the site's content, independent of
// GitHub (which only ever held the code, never the database). A single
// table erroring (e.g. a permissions hiccup) shouldn't block backing up
// everything else, so failures are collected rather than thrown.
export async function downloadFullBackup(client: SupabaseClient): Promise<BackupResult> {
  const data: Record<string, unknown[]> = {}
  const countsByTable: Record<string, number> = {}
  const failedTables: string[] = []

  for (const table of BACKUP_TABLES) {
    const { data: rows, error } = await client.from(table).select('*')
    if (error) {
      failedTables.push(table)
      continue
    }
    data[table] = rows ?? []
    countsByTable[table] = rows?.length ?? 0
  }

  // Media files live in Supabase Storage, not a database table — list the
  // bucket's contents (name, size, URL) instead of querying a "media" table.
  try {
    const { data: files, error } = await client.storage.from('media').list('', { limit: 1000 })
    if (error) throw error
    data.media = (files ?? [])
      .filter((f) => f.id !== null)
      .map((f) => ({
        name: f.name,
        size: f.metadata?.size ?? null,
        uploaded: f.created_at,
        url: client.storage.from('media').getPublicUrl(f.name).data.publicUrl,
      }))
    countsByTable.media = data.media.length
  } catch {
    failedTables.push('media')
  }

  if (Object.keys(data).length === 0) {
    throw new Error('Could not read any tables — check that you are logged in as admin.')
  }

  const backup = {
    site: 'SL Muslim History',
    createdAt: new Date().toISOString(),
    tables: data,
  }

  const dateStamp = new Date().toISOString().slice(0, 10)
  const filename = `sl-muslim-history-backup-${dateStamp}.json`

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return { countsByTable, failedTables, filename }
}
