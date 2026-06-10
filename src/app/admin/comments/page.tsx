'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { getAuthClient } from '@/lib/supabase-auth'

type Status = 'pending' | 'approved' | 'hidden' | 'spam'

interface Comment {
  id: string
  article_id: string
  name: string
  website: string | null
  content: string
  visitor_id: string
  ip_hash: string | null
  status: Status
  created_at: string
}

const TABS: { key: Status | 'all'; label: string; color: string }[] = [
  { key: 'pending',  label: 'Pending',  color: '#f59e0b' },
  { key: 'approved', label: 'Approved', color: '#22c55e' },
  { key: 'hidden',   label: 'Hidden',   color: '#94a3b8' },
  { key: 'spam',     label: 'Spam',     color: '#ef4444' },
  { key: 'all',      label: 'All',      color: '#6366f1' },
]

const STATUS_ACTIONS: { action: Status; label: string; bg: string }[] = [
  { action: 'approved', label: 'Approve', bg: '#22c55e' },
  { action: 'pending',  label: 'Pending', bg: '#f59e0b' },
  { action: 'hidden',   label: 'Hide',    bg: '#94a3b8' },
  { action: 'spam',     label: 'Spam',    bg: '#ef4444' },
]

export default function AdminCommentsPage() {
  const [tab,       setTab]       = useState<Status | 'all'>('pending')
  const [comments,  setComments]  = useState<Comment[]>([])
  const [loading,   setLoading]   = useState(true)
  const [counts,    setCounts]    = useState<Record<string, number>>({})
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [search,    setSearch]    = useState('')
  const [blocking,  setBlocking]  = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setSelected(new Set())

    // Load counts
    for (const t of ['pending', 'approved', 'hidden', 'spam'] as Status[]) {
      supabase.from('comments').select('id', { count: 'exact', head: true }).eq('status', t)
        .then(({ count }) => setCounts((prev) => ({ ...prev, [t]: count ?? 0 })))
    }

    const q = supabase.from('comments').select('*').order('created_at', { ascending: false })
    const { data } = tab === 'all' ? await q : await q.eq('status', tab)
    setComments(data ?? [])
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  async function setStatus(ids: string[], status: Status) {
    if (!supabase) return
    await getAuthClient().from('comments').update({ status }).in('id', ids)
    load()
  }

  async function deleteComments(ids: string[]) {
    if (!supabase || !confirm(`Delete ${ids.length} comment(s)?`)) return
    await getAuthClient().from('comments').delete().in('id', ids)
    load()
  }

  async function blockVisitor(visitorId: string, commentId: string) {
    if (!supabase || !confirm('Block this visitor? They will be unable to post comments.')) return
    setBlocking(visitorId)
    await getAuthClient().from('comment_blocks').upsert({ visitor_id: visitorId, reason: 'Admin blocked' })
    await setStatus([commentId], 'spam')
    setBlocking(null)
  }

  const filtered = comments.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.content.toLowerCase().includes(search.toLowerCase())
  )
  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id))

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((c) => c.id)))
  }

  const card: React.CSSProperties = { background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: 12 }
  const badge = (s: Status): React.CSSProperties => ({
    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
    background: s === 'approved' ? '#dcfce7' : s === 'spam' ? '#fee2e2' : s === 'hidden' ? '#f1f5f9' : '#fef9c3',
    color:      s === 'approved' ? '#15803d' : s === 'spam' ? '#dc2626' : s === 'hidden' ? '#64748b' : '#92400e',
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6" style={{ color: '#0f172a' }}>💬 Comment Moderation</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '6px 16px', borderRadius: 30, fontSize: 12, fontWeight: 700,
              background: tab === t.key ? t.color : '#f1f5f9',
              color: tab === t.key ? 'white' : '#475569',
              border: 'none', cursor: 'pointer',
            }}
          >
            {t.label}
            {t.key !== 'all' && counts[t.key] !== undefined && (
              <span style={{ marginLeft: 6, background: 'rgba(0,0,0,0.15)', padding: '1px 6px', borderRadius: 10 }}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + bulk actions */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input
          type="text" placeholder="Search by name or content…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 220 }}
        />
        {selected.size > 0 && (
          <div className="flex gap-2">
            {STATUS_ACTIONS.map((a) => (
              <button key={a.action} onClick={() => setStatus([...selected], a.action)}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: a.bg, color: 'white', border: 'none', cursor: 'pointer' }}>
                {a.label} ({selected.size})
              </button>
            ))}
            <button onClick={() => deleteComments([...selected])}
              style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#1e293b', color: 'white', border: 'none', cursor: 'pointer' }}>
              Delete ({selected.size})
            </button>
          </div>
        )}
        {filtered.length > 0 && (
          <label style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            Select all
          </label>
        )}
      </div>

      {/* Comment list */}
      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>No comments found.</p>
      ) : (
        filtered.map((c) => (
          <div key={c.id} style={{ ...card, borderLeft: `4px solid ${c.status === 'approved' ? '#22c55e' : c.status === 'spam' ? '#ef4444' : c.status === 'hidden' ? '#94a3b8' : '#f59e0b'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                <input type="checkbox" checked={selected.has(c.id)} onChange={(e) => {
                  setSelected((prev) => { const next = new Set(prev); e.target.checked ? next.add(c.id) : next.delete(c.id); return next })
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{c.name}</span>
                    {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#4a9e1f' }}>{c.website}</a>}
                    <span style={badge(c.status)}>{c.status}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(c.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.content}</p>
                  <div style={{ marginTop: 6, fontSize: 10, color: '#94a3b8' }}>
                    Article: <code style={{ fontFamily: 'monospace' }}>{c.article_id}</code>
                    {c.ip_hash && <> · IP hash: <code style={{ fontFamily: 'monospace' }}>{c.ip_hash.slice(0, 12)}…</code></>}
                  </div>
                </div>
              </div>

              {/* Per-comment actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {STATUS_ACTIONS.filter((a) => a.action !== c.status).map((a) => (
                  <button key={a.action} onClick={() => setStatus([c.id], a.action)}
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: a.bg, color: 'white', border: 'none', cursor: 'pointer' }}>
                    {a.label}
                  </button>
                ))}
                <button onClick={() => blockVisitor(c.visitor_id, c.id)} disabled={blocking === c.visitor_id}
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Block
                </button>
                <button onClick={() => deleteComments([c.id])}
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
