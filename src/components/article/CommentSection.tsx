'use client'

import { useState, useEffect, useRef } from 'react'
import { getVisitorId } from '@/lib/fingerprint'
import { formatDate } from '@/lib/utils'

interface Comment {
  id: string
  name: string
  website?: string | null
  content: string
  created_at: string
}

const COOLDOWN_MS = 60_000 // 60 s between submissions

export default function CommentSection({ articleId }: { articleId: string }) {
  const [comments,   setComments]   = useState<Comment[]>([])
  const [loading,    setLoading]    = useState(true)
  const [name,       setName]       = useState('')
  const [content,    setContent]    = useState('')
  const [website,    setWebsite]    = useState('')
  const [hp,         setHp]         = useState('')     // honeypot
  const [status,     setStatus]     = useState<'idle' | 'submitting' | 'success' | 'error' | 'rate'>('idle')
  const [errMsg,     setErrMsg]     = useState('')
  const [cooldown,   setCooldown]   = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch(`/api/comments?article_id=${articleId}`)
      .then((r) => r.json())
      .then((d) => { setComments(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))

    const last = parseInt(localStorage.getItem('slmh_last_comment') ?? '0', 10)
    const remaining = COOLDOWN_MS - (Date.now() - last)
    if (remaining > 0) startCooldown(Math.ceil(remaining / 1000))
  }, [articleId])

  function startCooldown(seconds: number) {
    setCooldown(seconds)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting' || cooldown > 0) return

    setStatus('submitting')
    setErrMsg('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          name:       name.trim(),
          content:    content.trim(),
          website:    website.trim() || null,
          visitor_id: getVisitorId(),
          hp,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setName(''); setContent(''); setWebsite('')
        localStorage.setItem('slmh_last_comment', Date.now().toString())
        startCooldown(60)
      } else if (res.status === 429) {
        setStatus('rate')
        setErrMsg(data.error ?? 'Too many comments. Please wait.')
      } else {
        setStatus('error')
        setErrMsg(data.error ?? 'Failed to submit. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrMsg('Network error. Please check your connection.')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 13,
    border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--dark)', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
      {/* Header */}
      <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--dark)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 Comments
        {comments.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'var(--green-light)', padding: '2px 10px', borderRadius: 20 }}>
            {comments.length}
          </span>
        )}
      </h3>

      {/* Comment list */}
      {loading ? (
        <div style={{ height: 60, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Loading comments…</span>
        </div>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ padding: '14px 16px', background: 'white', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--green-light)', color: 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 14, flexShrink: 0,
                }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {c.website ? (
                      <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                        target="_blank" rel="noopener noreferrer nofollow"
                        style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textDecoration: 'none' }}>
                        {c.name}
                      </a>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>{c.name}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDate(c.created_at)}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--dark)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 20px' }}>
        <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--dark)', marginBottom: 16 }}>Leave a Comment</h4>

        {status === 'success' ? (
          <div style={{ padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
            ✅ Your comment has been submitted for review. It will appear once approved.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot — visually hidden, bots fill it */}
            <input
              type="text" name="url_confirm" value={hp}
              onChange={(e) => setHp(e.target.value)}
              tabIndex={-1} autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" maxLength={60} style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green)' }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                  Website <span style={{ color: 'var(--muted)' }}>(optional)</span>
                </label>
                <input
                  type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com" maxLength={200} style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green)' }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                Comment <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                required value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts…" maxLength={1000} rows={4}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: 100 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
              <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                {content.length}/1000
              </div>
            </div>

            {(status === 'error' || status === 'rate') && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#dc2626', marginBottom: 12 }}>
                {errMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || cooldown > 0}
              style={{
                padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                background: cooldown > 0 ? 'var(--muted)' : 'var(--green)',
                color: 'white', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', opacity: status === 'submitting' ? 0.7 : 1,
              }}
            >
              {status === 'submitting'
                ? 'Submitting…'
                : cooldown > 0
                ? `Wait ${cooldown}s`
                : 'Submit Comment'}
            </button>
            <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
              Comments are reviewed before appearing · No account required
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
