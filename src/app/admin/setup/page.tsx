'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Status = 'checking' | 'ok' | 'missing' | 'error'

const SQL = 'ALTER TABLE news ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;'

export default function SetupPage() {
  const [status,  setStatus]  = useState<Status>('checking')
  const [message, setMessage] = useState('')
  const [running, setRunning] = useState(false)
  const [done,    setDone]    = useState(false)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => { checkColumn() }, [])

  async function checkColumn() {
    setStatus('checking')
    try {
      const res  = await fetch('/api/run-migration')
      const json = await res.json()
      if (json.column_exists) {
        setStatus('ok')
        setMessage(json.message)
      } else {
        setStatus('missing')
        setMessage(json.message ?? json.error)
      }
    } catch {
      setStatus('error')
      setMessage('Could not reach the API — check your network.')
    }
  }

  async function runMigration() {
    setRunning(true)
    try {
      const res  = await fetch('/api/run-migration', { method: 'POST' })
      const json = await res.json()
      if (json.ok) {
        setDone(true)
        setStatus('ok')
        setMessage('Column added successfully! Featured Stories will now work.')
      } else if (json.needs_manual) {
        setStatus('missing')
        setMessage('Automatic migration unavailable — follow the manual steps below.')
      } else {
        setStatus('error')
        setMessage(json.message ?? 'Unknown error')
      }
    } catch {
      setStatus('error')
      setMessage('Request failed — check your network.')
    }
    setRunning(false)
  }

  function copySQL() {
    navigator.clipboard.writeText(SQL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#94a3b8' }}>
          <Link href="/admin" className="hover:text-green-700 transition-colors">Dashboard</Link>
          <span>/</span>
          <span style={{ color: '#1e293b' }}>Database Setup</span>
        </div>
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Database Setup</h2>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          This page checks whether your Supabase database has the <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>is_featured</code> column needed for Featured Stories.
        </p>
      </div>

      {/* Status card */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: status === 'ok'      ? '#f0fdf4'
                    : status === 'missing'  ? '#fefce8'
                    : status === 'error'    ? '#fef2f2'
                    : '#f8fafc',
          border: `1px solid ${
            status === 'ok'      ? '#86efac'
          : status === 'missing'  ? '#fde68a'
          : status === 'error'    ? '#fecaca'
          : '#e2e8f0'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '24px' }}>
            {status === 'checking' ? '🔍'
           : status === 'ok'       ? '✅'
           : status === 'missing'  ? '⚠️'
           : '❌'}
          </span>
          <div>
            <p className="text-sm font-bold" style={{
              color: status === 'ok'      ? '#166534'
                   : status === 'missing'  ? '#92400e'
                   : status === 'error'    ? '#dc2626'
                   : '#475569',
            }}>
              {status === 'checking' ? 'Checking database…'
             : status === 'ok'       ? 'Database is ready'
             : status === 'missing'  ? 'Column is missing'
             : 'Check failed'}
            </p>
            {message && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{message}</p>}
          </div>
          {done && (
            <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>
              Done!
            </span>
          )}
        </div>
      </div>

      {/* ── Already OK ── */}
      {status === 'ok' && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <p className="text-sm font-bold" style={{ color: '#0f172a' }}>Everything is set up correctly ✅</p>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Go to <strong>Admin → News</strong>, edit any post, scroll to the <strong>Publish</strong> box, and check <strong>"Mark as Featured Story"</strong>, then save.
            The featured section will appear on <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>/news/janaza</code> or <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>/news/special</code> immediately.
          </p>
          <div className="flex gap-3">
            <Link
              href="/admin/news"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#4a9e1f' }}
            >
              Go to News Posts →
            </Link>
            <button
              onClick={checkColumn}
              className="px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: '#f1f5f9', color: '#475569' }}
            >
              Re-check
            </button>
          </div>
        </div>
      )}

      {/* ── Missing — try automatic first ── */}
      {status === 'missing' && !done && (
        <div className="space-y-4">

          {/* Option A: one-click */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <p className="text-sm font-extrabold mb-1" style={{ color: '#0f172a' }}>Option A — One-click fix</p>
            <p className="text-sm mb-4" style={{ color: '#64748b' }}>
              Click the button below. If your Vercel project has a <strong>SUPABASE_SERVICE_ROLE_KEY</strong> environment variable, this will fix the database automatically in one second.
            </p>
            <button
              onClick={runMigration}
              disabled={running}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: running ? '#94a3b8' : '#4a9e1f', cursor: running ? 'wait' : 'pointer' }}
            >
              {running ? '⏳ Running migration…' : '🚀 Fix Database Automatically'}
            </button>
          </div>

          {/* Option B: manual */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <p className="text-sm font-extrabold mb-1" style={{ color: '#0f172a' }}>Option B — Manual (2 minutes)</p>
            <p className="text-sm mb-4" style={{ color: '#64748b' }}>
              If Option A does not work, follow these steps in your Supabase dashboard.
            </p>

            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#4a9e1f' }}>1</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>Open Supabase</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Go to <strong>supabase.com</strong> → sign in → open your project</p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#4a9e1f' }}>2</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>Open the SQL Editor</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>In the left sidebar click <strong>SQL Editor</strong> (looks like a terminal icon), then click <strong>New query</strong></p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#4a9e1f' }}>3</span>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>Copy and paste this SQL</p>
                  <div className="relative">
                    <pre
                      className="rounded-xl p-3 text-xs overflow-x-auto"
                      style={{ background: '#0f172a', color: '#86efac', fontFamily: 'monospace', lineHeight: '1.6' }}
                    >
{SQL}
                    </pre>
                    <button
                      onClick={copySQL}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                      style={{ background: copied ? '#22c55e' : '#1e293b', color: 'white' }}
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#4a9e1f' }}>4</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>Click Run</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Press the green <strong>Run</strong> button (or Ctrl+Enter). You should see <em>"Success. No rows returned."</em></p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#4a9e1f' }}>5</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>Come back here and verify</p>
                  <button
                    onClick={checkColumn}
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-bold"
                    style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}
                  >
                    ✓ Check Again
                  </button>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#dc2626' }}>Could not connect to the database</p>
          <p className="text-sm" style={{ color: '#64748b' }}>Make sure your Supabase URL and anon key are set correctly in Vercel environment variables, then redeploy.</p>
          <button onClick={checkColumn} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#f1f5f9', color: '#475569' }}>
            Try Again
          </button>
        </div>
      )}

    </div>
  )
}
