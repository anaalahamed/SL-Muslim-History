'use client'

import Link from 'next/link'
import AnimateIn from '@/components/ui/AnimateIn'

export default function DonationCTA() {
  return (
    <section style={{ background: 'var(--green-deeper)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <AnimateIn direction="up">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '32px',
              flexWrap: 'wrap',
            }}
          >
            {/* Text */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  fontWeight: 900,
                  padding: '4px 12px',
                  borderRadius: '2px',
                  background: 'rgba(184,137,42,0.15)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(184,137,42,0.25)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                }}
              >
                ♥ Support Our Work
              </span>
              <h2
                className="serif-heading"
                style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '10px', lineHeight: 1.25 }}
              >
                Help Us Preserve History
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: '480px' }}>
                Your contribution keeps this archive alive — funding research, photography,
                and the documentation of Sri Lanka&apos;s 1,400-year Muslim heritage.
              </p>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0, flexWrap: 'wrap' }}>
              <Link
                href="/donate"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 28px',
                  borderRadius: '3px',
                  background: 'var(--gold)',
                  color: '#0f2a0f',
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 20px rgba(184,137,42,0.35)',
                  transition: 'all 0.2s ease',
                  minWidth: '160px',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(184,137,42,0.5)'
                  e.currentTarget.style.background = '#cfa040'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(184,137,42,0.35)'
                  e.currentTarget.style.background = 'var(--gold)'
                }}
              >
                ♥ Donate Now
              </Link>
              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '13px 22px',
                  borderRadius: '3px',
                  background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.82)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  minWidth: '130px',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
              >
                Learn More →
              </Link>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
