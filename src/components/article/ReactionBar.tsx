'use client'

import { useState, useEffect } from 'react'
import Emoji from '@/components/ui/Emoji'
import { getVisitorId, hashVisitorId } from '@/lib/fingerprint'

const REACTIONS = ['👍', '❤️', '🥰', '😍', '😡', '💯', '👏']

interface Count { emoji: string; count: number }
interface Props  { contentType: 'article' | 'news'; contentId: string }

const STORE_KEY = (type: string, id: string) => `slmh_reaction_${type}_${id}`

export default function ReactionBar({ contentType, contentId }: Props) {
  const [counts,     setCounts]     = useState<Count[]>(REACTIONS.map((e) => ({ emoji: e, count: 0 })))
  const [myReaction, setMyReaction] = useState<string | null>(null)
  const [loaded,     setLoaded]     = useState(false)
  const [busy,       setBusy]       = useState(false)

  useEffect(() => {
    const key = STORE_KEY(contentType, contentId)
    setMyReaction(localStorage.getItem(key))

    fetch(`/api/reactions?type=${contentType}&id=${contentId}`)
      .then((r) => r.json())
      .then((data: Count[]) => {
        setCounts(REACTIONS.map((e) => ({ emoji: e, count: data.find((r) => r.emoji === e)?.count ?? 0 })))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [contentType, contentId])

  async function react(emoji: string) {
    if (busy) return
    setBusy(true)

    const key    = STORE_KEY(contentType, contentId)
    const prevR  = myReaction
    const prevC  = counts.map((c) => ({ ...c }))
    const toggle = myReaction === emoji

    // Optimistic UI
    setCounts((prev) =>
      prev.map((c) => {
        if (c.emoji === prevR && prevR !== emoji) return { ...c, count: Math.max(0, c.count - 1) }
        if (c.emoji === emoji) return { ...c, count: toggle ? Math.max(0, c.count - 1) : c.count + 1 }
        return c
      })
    )
    const next = toggle ? null : emoji
    setMyReaction(next)
    if (next) localStorage.setItem(key, next)
    else localStorage.removeItem(key)

    try {
      const vid = getVisitorId()
      const hid = await hashVisitorId(vid)
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType, content_id: contentId, emoji, visitor_id: hid }),
      })
      if (res.ok) {
        const { reactions } = await res.json()
        setCounts(REACTIONS.map((e) => ({ emoji: e, count: reactions.find((r: Count) => r.emoji === e)?.count ?? 0 })))
      } else {
        setCounts(prevC); setMyReaction(prevR)
        if (prevR) localStorage.setItem(key, prevR); else localStorage.removeItem(key)
      }
    } catch {
      setCounts(prevC); setMyReaction(prevR)
    }
    setBusy(false)
  }

  const total = counts.reduce((s, c) => s + c.count, 0)

  return (
    <div style={{ padding: '16px 20px', background: 'white', borderRadius: 16, border: '1px solid var(--border)', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Reactions
        </span>
        {total > 0 && (
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{total.toLocaleString()} total</span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {counts.map(({ emoji, count }) => {
          const active = myReaction === emoji
          return (
            <button
              key={emoji}
              onClick={() => react(emoji)}
              disabled={busy || !loaded}
              title={emoji}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 30,
                border: `2px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                background: active ? 'var(--green-light)' : 'var(--bg)',
                cursor: busy ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                transform: active ? 'scale(1.08)' : 'scale(1)',
                opacity: loaded ? 1 : 0.5,
                boxShadow: active ? '0 0 0 1px var(--green)' : 'none',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--green-dark)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <Emoji emoji={emoji} size={20} />
              {count > 0 && (
                <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--green-dark)' : 'var(--dark)', minWidth: 14 }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {!myReaction && loaded && (
        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 10 }}>
          Click a reaction to respond · One reaction per person
        </p>
      )}
    </div>
  )
}
