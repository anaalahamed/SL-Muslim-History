'use client'

import { useState } from 'react'
import { getAuthClient } from '@/lib/supabase-auth'
import { downloadFullBackup, BACKUP_TABLES } from '@/lib/backup'

const TABLE_LABELS: Record<string, string> = {
  articles: 'Articles',
  news: 'News posts',
  categories: 'Categories',
  authors: 'Authors',
  comments: 'Comments',
  comment_blocks: 'Blocked commenters',
  reactions: 'Reactions',
  advertisements: 'Ads',
  contact_messages: 'Contact messages',
  newsletter_subscribers: 'Newsletter subscribers',
  site_settings: 'Site settings',
  media: 'Media library entries',
}

export default function AdminBackupPage() {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ filename: string; countsByTable: Record<string, number>; failedTables: string[] } | null>(null)

  const [codeDownloading, setCodeDownloading] = useState(false)
  const [codeProgress, setCodeProgress] = useState<number | null>(null) // 0-100, or null if unknown
  const [codeError, setCodeError] = useState<string | null>(null)

  async function handleBackup() {
    setWorking(true)
    setError(null)
    setResult(null)
    try {
      const outcome = await downloadFullBackup(getAuthClient())
      setResult(outcome)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while creating the backup.')
    } finally {
      setWorking(false)
    }
  }

  async function handleDownloadCode() {
    setCodeDownloading(true)
    setCodeError(null)
    setCodeProgress(0)
    try {
      const res = await fetch('/api/admin/download-source')
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Could not download the website code. Please try again.')
      }

      const total = Number(res.headers.get('content-length') ?? 0)
      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          chunks.push(value)
          received += value.length
          setCodeProgress(total > 0 ? Math.min(99, Math.round((received / total) * 100)) : null)
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'application/zip' })
      const dateStamp = new Date().toISOString().slice(0, 10)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sl-muslim-history-code-${dateStamp}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setCodeProgress(100)
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Something went wrong while downloading the code.')
      setCodeProgress(null)
    } finally {
      setCodeDownloading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">

      <div>
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Backup</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
          Save a full copy of everything on your site, in case anything ever happens to it.
        </p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <div className="text-3xl mb-3">🗄️</div>
        <h3 className="text-base font-extrabold mb-2" style={{ color: '#0f172a' }}>Download Full Backup</h3>
        <p className="text-sm mb-5" style={{ color: '#64748b', lineHeight: 1.6 }}>
          This saves one file to your computer containing every article, news post, comment, category,
          author, ad, and setting on your site — everything stored in your database.
        </p>

        <button
          onClick={handleBackup}
          disabled={working}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: working ? '#94a3b8' : '#4a9e1f', boxShadow: working ? 'none' : '0 2px 8px rgba(74,158,31,0.3)' }}
        >
          {working ? 'Preparing your backup…' : '⬇ Download Full Backup'}
        </button>

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-xl p-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p className="text-sm font-bold mb-3" style={{ color: '#15803d' }}>
              ✅ Saved as {result.filename}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
              {BACKUP_TABLES.filter((t) => !result.failedTables.includes(t)).map((table) => (
                <p key={table} className="text-xs" style={{ color: '#166534' }}>
                  {TABLE_LABELS[table] ?? table}: <span className="font-bold">{result.countsByTable[table] ?? 0}</span>
                </p>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: '#4d7c0f' }}>
              Keep this file somewhere safe — an email to yourself, a USB drive, or cloud storage like Google Drive all work well.
            </p>
          </div>
        )}

        {result && result.failedTables.length > 0 && (
          <div className="mt-3 rounded-xl px-4 py-3 text-xs font-semibold" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
            ⚠ Everything else saved fine, but these couldn&apos;t be read and were left out: {result.failedTables.map((t) => TABLE_LABELS[t] ?? t).join(', ')}. Tell me if you see this and I&apos;ll take a look.
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <div className="text-3xl mb-3">💻</div>
        <h3 className="text-base font-extrabold mb-2" style={{ color: '#0f172a' }}>Download Website Code</h3>
        <p className="text-sm mb-5" style={{ color: '#64748b', lineHeight: 1.6 }}>
          This saves the actual website itself — every page, design, and feature — as one file to your
          computer. It&apos;s always safely stored online too, but this gives you your own personal copy
          without needing to visit GitHub separately.
        </p>
        <button
          onClick={handleDownloadCode}
          disabled={codeDownloading}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: codeDownloading ? '#94a3b8' : '#0369a1', boxShadow: codeDownloading ? 'none' : '0 2px 8px rgba(3,105,161,0.3)' }}
        >
          {codeDownloading
            ? (codeProgress !== null ? `Downloading… ${codeProgress}%` : 'Downloading…')
            : '⬇ Download Website Code'}
        </button>

        {codeDownloading && (
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#e2e8f0', maxWidth: '280px' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: codeProgress !== null ? `${codeProgress}%` : '30%',
                background: '#0369a1',
              }}
            />
          </div>
        )}

        {codeError && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {codeError}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-5" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        <p className="text-sm font-bold mb-1" style={{ color: '#92400e' }}>💡 How often should I do this?</p>
        <p className="text-xs" style={{ color: '#a16207', lineHeight: 1.6 }}>
          Once a week or once a month is a good habit — and definitely right after you make a lot of changes
          (like publishing several new articles). It only takes one click.
        </p>
      </div>

    </div>
  )
}
