'use client'

import { useState, useEffect, useCallback } from 'react'
import Emoji from '@/components/ui/Emoji'
import { getVisitorId, hashVisitorId } from '@/lib/fingerprint'
import { DEFAULT_REACTIONS, JANAZA_REACTIONS, REACTION_LABELS } from '@/lib/reactions'

interface Count { emoji: string; count: number }
interface Props {
  contentType: 'article' | 'news'
  contentId:   string
  /** Pass 'janaza' for Janaza News. All other content uses the default social order. */
  order?:      'janaza' | 'default'
}

const MAX_CHANGES = 4

export default function ReactionBar({ contentType, contentId, order = 'default' }: Props) {
  const REACTIONS = order === 'janaza' ? JANAZA_REACTIONS : DEFAULT_REACTIONS
  const [counts,           setCounts]           = useState<Count[]>(REACTIONS.map((e) => ({ emoji: e, count: 0 })))
  const [myReaction,       setMyReaction]       = useState<string | null>(null)
  const [changesRemaining, setChangesRemaining] = useState(MAX_CHANGES)
  const [loaded,           setLoaded]           = useState(false)
  const [busy,             setBusy]             = useState(false)
  const [limitMsg,         setLimitMsg]         = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const vid = getVisitorId()
      const hid = await hashVisitorId(vid)
      if (cancelled) return

      fetch(`/api/reactions?type=${contentType}&id=${contentId}&visitor_id=${hid}`)
        .then((r) => r.json())
        .then((data: { reactions: Count[]; myReaction: string | null; changesRemaining: number }) => {
          if (cancelled) return
          setCounts(REACTIONS.map((e) => ({ emoji: e, count: data.reactions.find((r) => r.emoji === e)?.count ?? 0 })))
          setMyReaction(data.myReaction)
          setChangesRemaining(data.changesRemaining)
          setLoaded(true)
        })
        .catch(() => setLoaded(true))
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId])

  const react = useCallback(async (emoji: string) => {
    if (busy) return

    // Out of changes — this click would be a no-op on the server too, so
    // just show a message instead of making a wasted network call.
    if (changesRemaining <= 0) {
      setLimitMsg(true)
      return
    }
    setLimitMsg(false)
    setBusy(true)

    const prevR  = myReaction
    const prevC  = counts.map((c) => ({ ...c }))
    const prevChanges = changesRemaining
    const toggle = myReaction === emoji

    // Optimistic UI — instant visual update before the network call returns
    setCounts((prev) =>
      prev.map((c) => {
        if (c.emoji === prevR && prevR !== emoji) return { ...c, count: Math.max(0, c.count - 1) }
        if (c.emoji === emoji) return { ...c, count: toggle ? Math.max(0, c.count - 1) : c.count + 1 }
        return c
      })
    )
    const next = toggle ? null : emoji
    setMyReaction(next)
    setChangesRemaining((n) => Math.max(0, n - 1))

    try {
      const vid = getVisitorId()
      const hid = await hashVisitorId(vid)
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType, content_id: contentId, emoji, visitor_id: hid }),
      })
      if (res.ok) {
        const body = await res.json()
        // 'recount_failed' means the write succeeded but SELECT is blocked by RLS.
        // Keep the optimistic count rather than resetting everything to zero.
        if (body.reactions !== 'recount_failed') {
          const reactions: Count[] = body.reactions
          setCounts(REACTIONS.map((e) => ({ emoji: e, count: reactions.find((r) => r.emoji === e)?.count ?? 0 })))
        }
        setMyReaction(body.myReaction ?? null)
        setChangesRemaining(body.changesRemaining ?? 0)
        if ((body.changesRemaining ?? 0) <= 0) setLimitMsg(true)
      } else {
        // Revert optimistic update on server error (INSERT/UPDATE/DELETE failed)
        setCounts(prevC)
        setMyReaction(prevR)
        setChangesRemaining(prevChanges)
      }
    } catch {
      setCounts(prevC)
      setMyReaction(prevR)
      setChangesRemaining(prevChanges)
    }
    setBusy(false)
  }, [busy, contentType, contentId, myReaction, counts, changesRemaining])

  const total = counts.reduce((s, c) => s + c.count, 0)

  return (
    <div
      role="region"
      aria-label="Post reactions"
      style={{ padding: '16px 20px', background: 'white', borderRadius: 16, border: '1px solid var(--border)', marginTop: 16 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Reactions
        </span>
        {total > 0 && (
          <span style={{ fontSize: 11, color: 'var(--muted)' }} aria-live="polite">
            {total.toLocaleString()} total
          </span>
        )}
      </div>

      {/* Reaction buttons — wrap on narrow screens */}
      <div
        role="group"
        aria-label="Choose a reaction"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
      >
        {counts.map(({ emoji, count }) => {
          const active  = myReaction === emoji
          const label   = REACTION_LABELS[emoji] ?? emoji
          const ariaLbl = `${label}${count > 0 ? `, ${count}` : ''}${active ? ', selected' : ''}`

          return (
            <button
              key={emoji}
              onClick={() => react(emoji)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); react(emoji) } }}
              disabled={busy || !loaded}
              aria-label={ariaLbl}
              aria-pressed={active}
              title={label}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 11px', borderRadius: 30,
                border: `2px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                background: active ? 'var(--green-light)' : 'var(--bg)',
                cursor: busy || !loaded ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                transform: active ? 'scale(1.08)' : 'scale(1)',
                opacity: loaded ? 1 : 0.5,
                boxShadow: active ? '0 0 0 1px var(--green)' : 'none',
                outline: 'none',
                // Minimum touch target 44×44 px for mobile
                minHeight: 36,
                minWidth: 36,
              }}
              onMouseEnter={(e) => {
                if (!active && !busy) {
                  e.currentTarget.style.borderColor = 'var(--green-dark)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--green)'
                e.currentTarget.style.outlineOffset = '2px'
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none'
                e.currentTarget.style.outlineOffset = '0'
              }}
            >
              <Emoji emoji={emoji} size={18} label={label} />
              {/* Only show count when > 0 — never show 0 */}
              {count > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: 12, fontWeight: 700,
                    color: active ? 'var(--green-dark)' : 'var(--dark)',
                    minWidth: 12,
                    lineHeight: 1,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loaded && limitMsg && (
        <p style={{ fontSize: 10, color: '#dc2626', marginTop: 10 }} aria-live="polite">
          You've reached the limit of {MAX_CHANGES} reaction changes for this post.
        </p>
      )}
      {loaded && !limitMsg && !myReaction && (
        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 10 }} aria-live="polite">
          Click a reaction to respond · One reaction per person
        </p>
      )}
      {loaded && !limitMsg && myReaction && changesRemaining < MAX_CHANGES && (
        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 10 }} aria-live="polite">
          You can change your reaction {changesRemaining} more time{changesRemaining === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}
