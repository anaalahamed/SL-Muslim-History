'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Item = { id: string; title: string; news_type: string; is_featured: boolean | null }

type CheckResult = {
  column_exists:  boolean
  total_rows?:    number
  featured_count?: number
  featured_items?: Item[]
  all_items?:     Item[]
  error?:         string | null
  message?:       string
}

type RlsOp    = { ok: boolean; error?: string }
type RlsResult = {
  all_ok:     boolean
  operations: { INSERT: RlsOp; SELECT: RlsOp; UPDATE: RlsOp; DELETE: RlsOp }
  diagnosis:  string
  fix_sql:    string | null
}

const SQL     = 'ALTER TABLE news ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;'
const RLS_SQL = `-- Step 1: grant table-level access to the anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE reactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE reactions TO authenticated;

-- Step 2: enable RLS and create permissive policies
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select" ON reactions;
CREATE POLICY "reactions_select" ON reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON reactions;
CREATE POLICY "reactions_insert" ON reactions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "reactions_update" ON reactions;
CREATE POLICY "reactions_update" ON reactions
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reactions_delete" ON reactions;
CREATE POLICY "reactions_delete" ON reactions
  FOR DELETE USING (true);`

const SITE_SETTINGS_SQL = `-- Fix 401 "No API key found" on site_settings requests.
-- Grants read/write access and enables permissive RLS policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE site_settings TO authenticated;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select" ON site_settings;
CREATE POLICY "site_settings_select" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_upsert" ON site_settings;
CREATE POLICY "site_settings_upsert" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);`

export default function SetupPage() {
  const [result,       setResult]       = useState<CheckResult | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [running,      setRunning]      = useState(false)
  const [migrMsg,      setMigrMsg]      = useState('')
  const [copied,       setCopied]       = useState(false)
  const [rlsResult,    setRlsResult]    = useState<RlsResult | null>(null)
  const [rlsLoading,   setRlsLoading]   = useState(false)
  const [rlsCopied,    setRlsCopied]    = useState(false)
  const [ssCopied,     setSsCopied]     = useState(false)

  async function testRls() {
    setRlsLoading(true)
    try {
      const r = await fetch('/api/check-reactions')
      setRlsResult(await r.json())
    } catch {
      setRlsResult(null)
    }
    setRlsLoading(false)
  }

  function copyRlsSql() {
    navigator.clipboard.writeText(RLS_SQL).then(() => {
      setRlsCopied(true)
      setTimeout(() => setRlsCopied(false), 2500)
    })
  }

  function copySsSql() {
    navigator.clipboard.writeText(SITE_SETTINGS_SQL).then(() => {
      setSsCopied(true)
      setTimeout(() => setSsCopied(false), 2500)
    })
  }

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/run-migration')
      setResult(await r.json())
    } catch {
      setResult({ column_exists: false, error: 'Could not reach the API.' })
    }
    setLoading(false)
  }

  async function runMigration() {
    setRunning(true)
    setMigrMsg('')
    try {
      const r    = await fetch('/api/run-migration', { method: 'POST' })
      const json = await r.json()
      setMigrMsg(json.message ?? '')
      if (json.ok) load()
    } catch {
      setMigrMsg('Request failed.')
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
          Checks the <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>is_featured</code> column and shows exactly which news posts are currently marked as Featured Stories.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p className="text-sm" style={{ color: '#94a3b8' }}>🔍 Checking database…</p>
        </div>
      )}

      {!loading && result && (

        <>
          {/* ── Column status ── */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: result.column_exists ? '#f0fdf4' : '#fefce8',
              border: `1px solid ${result.column_exists ? '#86efac' : '#fde68a'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '22px' }}>{result.column_exists ? '✅' : '⚠️'}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: result.column_exists ? '#166534' : '#92400e' }}>
                  {result.column_exists
                    ? 'is_featured column exists in the database'
                    : 'is_featured column is MISSING'}
                </p>
                {result.column_exists && (
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    {result.total_rows ?? 0} total news posts in database
                  </p>
                )}
              </div>
              <button
                onClick={load}
                className="ml-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: '#f1f5f9', color: '#475569' }}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* ── Column missing — fix options ── */}
          {!result.column_exists && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                <p className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>Option A — One-click fix</p>
                <button
                  onClick={runMigration}
                  disabled={running}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: running ? '#94a3b8' : '#4a9e1f', cursor: running ? 'wait' : 'pointer' }}
                >
                  {running ? '⏳ Running…' : '🚀 Fix Database Automatically'}
                </button>
                {migrMsg && <p className="text-xs mt-2" style={{ color: '#64748b' }}>{migrMsg}</p>}
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                <p className="text-sm font-extrabold mb-3" style={{ color: '#0f172a' }}>Option B — Manual (2 min)</p>
                <ol className="space-y-3 text-sm" style={{ color: '#475569' }}>
                  <li><strong>1.</strong> Go to <strong>supabase.com</strong> → sign in → open your project</li>
                  <li><strong>2.</strong> Click <strong>SQL Editor</strong> in the left sidebar → <strong>New query</strong></li>
                  <li>
                    <strong>3.</strong> Copy this SQL and paste it:
                    <div className="relative mt-2">
                      <pre className="rounded-xl p-3 text-xs overflow-x-auto" style={{ background: '#0f172a', color: '#86efac', fontFamily: 'monospace' }}>{SQL}</pre>
                      <button onClick={copySQL} className="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: copied ? '#22c55e' : '#1e293b', color: 'white' }}>
                        {copied ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                  </li>
                  <li><strong>4.</strong> Click the green <strong>Run</strong> button</li>
                  <li><strong>5.</strong> Come back and click <strong>Refresh</strong> above</li>
                </ol>
              </div>
            </div>
          )}

          {/* ── Column exists — show featured items ── */}
          {result.column_exists && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0', background: 'white' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <p className="text-sm font-extrabold" style={{ color: '#0f172a' }}>
                  Featured Stories in Database
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-black"
                    style={{
                      background: (result.featured_count ?? 0) > 0 ? '#dcfce7' : '#fef9c3',
                      color:      (result.featured_count ?? 0) > 0 ? '#166534' : '#92400e',
                    }}
                  >
                    {result.featured_count ?? 0} marked
                  </span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  {(result.featured_count ?? 0) === 0
                    ? 'No posts are marked as Featured Story yet. Edit a news post and check the box.'
                    : 'These posts have is_featured = true in the database.'}
                </p>
              </div>

              {(result.featured_count ?? 0) === 0 ? (
                <div className="px-5 py-8 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm font-semibold" style={{ color: '#64748b' }}>No featured items yet</p>
                  <p className="text-xs mt-1 mb-4" style={{ color: '#94a3b8' }}>
                    Go to Admin → News, open any post, check "Mark as Featured Story" in the Publish box, then save.
                  </p>
                  <Link
                    href="/admin/news"
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-block"
                    style={{ background: '#4a9e1f' }}
                  >
                    Go to News Posts →
                  </Link>
                </div>
              ) : (
                <div>
                  {result.featured_items?.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: i < (result.featured_items!.length - 1) ? '1px solid #f8fafc' : 'none' }}
                    >
                      <span style={{ fontSize: '16px' }}>⭐</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{item.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                          {item.news_type === 'janaza' ? 'Janaza News → /news/janaza' : 'Special News → /news/special'}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={item.news_type === 'janaza'
                          ? { background: '#f0f9ff', color: '#0369a1' }
                          : { background: '#f0fdf4', color: '#166534' }}
                      >
                        {item.news_type === 'janaza' ? 'Janaza' : 'சிறப்பு'}
                      </span>
                    </div>
                  ))}

                  {/* Links to the actual pages */}
                  <div className="px-5 py-4 flex gap-3 flex-wrap" style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <p className="text-xs font-semibold w-full mb-1" style={{ color: '#475569' }}>
                      If these posts are featured here but the section still doesn't appear on the page, open the link below in a new tab and check the browser Console (F12 → Console tab):
                    </p>
                    <a
                      href="/news/janaza"
                      target="_blank"
                      className="px-4 py-2 rounded-xl text-xs font-bold"
                      style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
                    >
                      Open /news/janaza ↗
                    </a>
                    <a
                      href="/news/special"
                      target="_blank"
                      className="px-4 py-2 rounded-xl text-xs font-bold"
                      style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}
                    >
                      Open /news/special ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── All posts table ── */}
          {result.column_exists && (result.all_items?.length ?? 0) > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0', background: 'white' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#94a3b8' }}>All news posts — is_featured value</p>
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {result.all_items?.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{
                      borderBottom: i < (result.all_items!.length - 1) ? '1px solid #f8fafc' : 'none',
                      background: item.is_featured ? '#f0fdf4' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '13px', opacity: item.is_featured ? 1 : 0.3 }}>⭐</span>
                    <p className="flex-1 text-xs truncate" style={{ color: '#1e293b' }}>{item.title}</p>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                      style={item.is_featured
                        ? { background: '#dcfce7', color: '#166534' }
                        : { background: '#f1f5f9', color: '#94a3b8' }}
                    >
                      {item.is_featured === true  ? 'true'
                     : item.is_featured === false ? 'false'
                     : 'null'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — site_settings 401 Fix
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '24px', marginTop: '8px' }}>
        <h3 className="text-base font-extrabold mb-1" style={{ color: '#0f172a' }}>
          site_settings — 401 Fix
        </h3>
        <p className="text-sm mb-4" style={{ color: '#64748b' }}>
          If your browser Network tab shows a 401 <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>site_settings?select=config&amp;id=eq.1</code> request
          with <em>"No API key found"</em>, the table is missing GRANT permissions for the anon role.
          Run this SQL once in your Supabase SQL Editor to fix it permanently.
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0', background: 'white' }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              SQL — run once in Supabase SQL Editor
            </p>
            <button
              onClick={copySsSql}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: ssCopied ? '#22c55e' : '#1e293b', color: 'white' }}
            >
              {ssCopied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <pre
            className="px-5 py-4 text-xs overflow-x-auto"
            style={{ background: '#0f172a', color: '#86efac', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}
          >
{SITE_SETTINGS_SQL}
          </pre>
        </div>
        <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
          After running, refresh the page — the 401 in the Network tab will be gone.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — Reactions RLS Check
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '24px', marginTop: '8px' }}>
        <h3 className="text-base font-extrabold mb-1" style={{ color: '#0f172a' }}>Reactions — RLS Check</h3>
        <p className="text-sm mb-4" style={{ color: '#64748b' }}>
          If clicking a reaction flashes a count then immediately returns to zero, the Supabase
          <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}> reactions </code>
          table is blocking the anon key via Row Level Security. Click the button to test all four operations.
        </p>

        <button
          onClick={testRls}
          disabled={rlsLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all mb-4"
          style={{ background: rlsLoading ? '#94a3b8' : '#0369a1', cursor: rlsLoading ? 'wait' : 'pointer' }}
        >
          {rlsLoading ? '⏳ Testing…' : '🔍 Test Reactions RLS'}
        </button>

        {rlsResult && (
          <div className="space-y-4">
            {/* Per-operation status */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0', background: 'white' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  RLS operation results (anon key)
                </p>
              </div>
              {(['INSERT', 'SELECT', 'UPDATE', 'DELETE'] as const).map((op) => {
                const r = rlsResult.operations[op]
                return (
                  <div
                    key={op}
                    className="flex items-center gap-4 px-5 py-3"
                    style={{ borderBottom: op !== 'DELETE' ? '1px solid #f8fafc' : 'none' }}
                  >
                    <span style={{ fontSize: 16 }}>{r.ok ? '✅' : '❌'}</span>
                    <span className="text-sm font-bold w-16" style={{ color: r.ok ? '#166534' : '#dc2626' }}>{op}</span>
                    <span className="text-xs flex-1" style={{ color: r.ok ? '#64748b' : '#dc2626' }}>
                      {r.ok ? 'Allowed' : (r.error ?? 'Blocked')}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Diagnosis */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: rlsResult.all_ok ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${rlsResult.all_ok ? '#86efac' : '#fecaca'}`,
              }}
            >
              <p className="text-sm font-semibold" style={{ color: rlsResult.all_ok ? '#166534' : '#dc2626' }}>
                {rlsResult.all_ok ? '✅ Reactions are fully working — RLS is correctly configured.' : '❌ ' + rlsResult.diagnosis}
              </p>
            </div>

            {/* Fix SQL */}
            {!rlsResult.all_ok && (
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                <p className="text-sm font-extrabold mb-1" style={{ color: '#0f172a' }}>Fix — run this SQL in Supabase</p>
                <p className="text-xs mb-3" style={{ color: '#64748b' }}>
                  Go to <strong>supabase.com</strong> → your project → <strong>SQL Editor</strong> → <strong>New query</strong> → paste → click <strong>Run</strong>.
                </p>
                <div className="relative">
                  <pre
                    className="rounded-xl p-4 text-xs overflow-x-auto"
                    style={{ background: '#0f172a', color: '#86efac', fontFamily: 'monospace', lineHeight: 1.7 }}
                  >
{RLS_SQL}
                  </pre>
                  <button
                    onClick={copyRlsSql}
                    className="absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: rlsCopied ? '#22c55e' : '#1e293b', color: 'white' }}
                  >
                    {rlsCopied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
                  After running, click <strong>Test Reactions RLS</strong> again to confirm all four operations turn green.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
