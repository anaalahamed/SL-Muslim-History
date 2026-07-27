'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import { REACTIONS } from '@/lib/reactions'
import { getAuthClient } from '@/lib/supabase-auth'

const EMOJIS = [...REACTIONS]

interface ReactionSummary {
  content_type: string
  content_id: string
  total: number
  breakdown: Record<string, number>
  latest: string
}

export default function AdminReactionsPage() {
  const [rows,        setRows]        = useState<ReactionSummary[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filterType,  setFilterType]  = useState<'all' | 'article' | 'news'>('all')
  const [resetting,   setResetting]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const authClient = getAuthClient()
    const q = authClient.from('reactions').select('content_type, content_id, emoji, created_at')
      .order('created_at', { ascending: false })
    const { data } = filterType === 'all' ? await q : await q.eq('content_type', filterType)

    if (!data) { setLoading(false); return }

    const map = new Map<string, ReactionSummary>()
    for (const r of data) {
      if (!r.emoji) continue // visitor removed their reaction — row kept only for change-limit tracking
      const key = `${r.content_type}::${r.content_id}`
      if (!map.has(key)) {
        map.set(key, { content_type: r.content_type, content_id: r.content_id, total: 0, breakdown: {}, latest: r.created_at })
      }
      const s = map.get(key)!
      s.total++
      s.breakdown[r.emoji] = (s.breakdown[r.emoji] ?? 0) + 1
    }
    setRows([...map.values()].sort((a, b) => b.total - a.total))
    setLoading(false)
  }, [filterType])

  useEffect(() => { load() }, [load])

  async function resetReactions(contentType: string, contentId: string) {
    if (!confirm(`Delete all reactions for this ${contentType}?`)) return
    setResetting(contentId)
    await getAuthClient().from('reactions').delete().eq('content_type', contentType).eq('content_id', contentId)
    setResetting(null)
    load()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6" style={{ color: '#0f172a' }}>⭐ Reaction Statistics</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'article', 'news'] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            style={{
              padding: '6px 16px', borderRadius: 30, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: filterType === t ? '#4a9e1f' : '#f1f5f9',
              color: filterType === t ? 'white' : '#475569',
            }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>No reactions yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((row) => (
            <div key={`${row.content_type}::${row.content_id}`}
              style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                    background: row.content_type === 'article' ? '#dbeafe' : '#f0fdf4',
                    color: row.content_type === 'article' ? '#1d4ed8' : '#15803d',
                  }}>
                    {row.content_type.toUpperCase()}
                  </span>
                  <code style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                    {row.content_id}
                  </code>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#4a9e1f' }}>{row.total} reactions</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>Latest: {formatDate(row.latest)}</span>
                </div>

                {/* Emoji breakdown */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {EMOJIS.filter((e) => row.breakdown[e]).map((e) => (
                    <span key={e} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                      {e} <strong>{row.breakdown[e]}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => resetReactions(row.content_type, row.content_id)}
                disabled={resetting === row.content_id}
                style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                {resetting === row.content_id ? 'Resetting…' : 'Reset'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
