'use client'

import { useState } from 'react'
import AnimateIn from '@/components/ui/AnimateIn'
import { supabase } from '@/lib/supabase'

export default function NewsletterBox() {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    if (supabase) {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase() })
      if (error) {
        if (error.code === '23505') {
          setStatus('success')
          setMessage('You are already subscribed!')
        } else {
          setStatus('error')
          setMessage('Something went wrong. Please try again.')
        }
      } else {
        setStatus('success')
        setMessage('Thank you for subscribing!')
        setEmail('')
      }
    } else {
      setStatus('success')
      setMessage('Thank you! We will be in touch.')
      setEmail('')
    }
  }

  return (
    <section style={{ background: 'var(--green-dark)', borderTop: '3px solid var(--gold)', padding: '56px 24px' }}>
      <AnimateIn direction="up">
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>

          {/* Icon */}
          <div className="animate-float" style={{ fontSize: '44px', marginBottom: '16px', display: 'inline-block' }}>📬</div>

          {/* Label */}
          <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>
            Newsletter
          </p>

          {/* Heading */}
          <h2
            className="serif-heading"
            style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '10px', lineHeight: 1.25 }}
          >
            Stay Updated
          </h2>

          {/* Subtext */}
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '28px' }}>
            Subscribe to receive the latest articles and news about Sri Lanka&apos;s Muslim heritage delivered directly to your inbox.
          </p>

          {/* Form / success */}
          {status === 'success' ? (
            <div
              style={{
                padding: '14px 24px',
                background: 'rgba(45,107,48,0.4)',
                border: '1px solid rgba(45,107,48,0.6)',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#86efac',
              }}
            >
              ✅ {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0', maxWidth: '420px', margin: '0 auto' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '13px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRight: 'none',
                  color: 'white',
                  outline: 'none',
                  borderRadius: '3px 0 0 3px',
                  fontFamily: "'Noto Sans Tamil', 'Lato', sans-serif",
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  padding: '12px 22px',
                  background: status === 'loading' ? '#666' : 'var(--gold)',
                  color: status === 'loading' ? 'rgba(255,255,255,0.6)' : '#0f2a0f',
                  border: 'none',
                  borderRadius: '0 3px 3px 0',
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { if (status !== 'loading') e.currentTarget.style.background = '#cfa040' }}
                onMouseLeave={(e) => { if (status !== 'loading') e.currentTarget.style.background = 'var(--gold)' }}
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe →'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p style={{ fontSize: '12px', marginTop: '10px', color: '#f87171', fontWeight: 600 }}>{message}</p>
          )}

          <p style={{ fontSize: '11px', marginTop: '14px', color: 'rgba(255,255,255,0.3)' }}>
            No spam. Unsubscribe anytime. Join 1,240+ subscribers.
          </p>
        </div>
      </AnimateIn>
    </section>
  )
}
