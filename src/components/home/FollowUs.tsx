'use client'

import { useState, useEffect } from 'react'
import { getAdminConfig } from '@/lib/adminConfig'
import { supabase } from '@/lib/supabase'

const PLATFORMS = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877f2',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    color: '#dc2626',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    color: '#25d366',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    color: '#000000',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#e1306c',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
]

interface ActiveLink { label: string; href: string; color: string; icon: React.ReactNode }

export default function FollowUs() {
  const [links,   setLinks]   = useState<ActiveLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      let cfg: Record<string, string> = {}

      // Try Supabase first (works across all devices)
      if (supabase) {
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('config')
            .eq('id', 1)
            .maybeSingle()
          if (data?.config && typeof data.config === 'object') {
            cfg = data.config as Record<string, string>
          }
        } catch {
          // ignore — fall through to localStorage
        }
      }

      // Fallback to localStorage (admin's own device)
      if (!Object.values(cfg).some(Boolean)) {
        const local = getAdminConfig()
        cfg = {
          facebook:  local.facebook,
          youtube:   local.youtube,
          whatsapp:  local.whatsapp,
          twitter:   local.twitter,
          instagram: local.instagram,
        }
      }

      const active = PLATFORMS
        .filter((p) => !!cfg[p.key])
        .map((p) => ({ label: p.label, href: cfg[p.key], color: p.color, icon: p.icon }))

      setLinks(active)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return null
  if (links.length === 0) return null

  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ background: 'var(--green-dark)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '5px 11px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Follow Us
        </div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginLeft: '8px' }} />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        {links.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderBottom: i < links.length - 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none',
              transition: 'background 0.15s',
              minWidth: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-pale)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {/* Platform icon */}
            <span
              style={{
                width: '28px', height: '28px', borderRadius: '5px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: link.color, color: 'white', flexShrink: 0,
              }}
            >
              {link.icon}
            </span>
            {/* Platform name only — no raw URL shown */}
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark)', minWidth: 0 }}>
              {link.label}
            </span>
            {/* Arrow */}
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}>→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
