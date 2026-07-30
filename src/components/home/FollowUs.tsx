'use client'

import { useState, useEffect } from 'react'
import { getAdminConfig } from '@/lib/adminConfig'
import { getSiteSettings } from '@/lib/db/siteSettings'

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
    label: 'X',
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
  {
    key: 'telegram',
    label: 'Telegram',
    color: '#26A5E4',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.457 8.184c-.176 1.9-.943 6.502-1.333 8.627-.165.9-.49 1.201-.804 1.23-.683.065-1.202-.46-1.864-.902-1.036-.693-1.622-1.124-2.627-1.8-1.162-.78-.409-1.21.253-1.91.174-.184 3.188-2.977 3.247-3.23a.243.243 0 0 0-.055-.212c-.052-.058-.171-.041-.244-.024-.104.024-1.76 1.14-4.964 3.345-.47.33-.896.49-1.278.48-.42-.008-1.229-.241-1.83-.44-.737-.245-1.323-.374-1.272-.789.027-.216.319-.437.876-.663 3.43-1.524 5.72-2.529 6.864-3.014 3.268-1.386 3.948-1.627 4.39-1.635.098-.002.315.023.456.14a.5.5 0 0 1 .168.325c.016.093.036.306.02.472z" />
      </svg>
    ),
  },
  {
    key: 'reddit',
    label: 'Reddit',
    color: '#FF4500',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
        <path d="M440.3 203.5c-15 0-28.2 6.2-37.9 15.9-35.8-24.2-83.3-39.6-135.8-41.9l25.4-108.4 79.6 18.4c0 25.2 20.4 45.6 45.6 45.6 25.2 0 45.6-20.7 45.6-45.9s-20.4-45.6-45.6-45.6c-18.2 0-33.8 11-41.3 26.6l-88.4-19.9c-4.2-1-8.5 1.7-9.4 6l-28.4 121.9c-52.2 2.5-99.4 17.9-135.2 41.9-9.7-9.7-23.2-15.9-38.2-15.9-63.4 0-84.1 85.1-27 116.9-2 7.2-3 15-3 22.9 0 88 100.2 159.5 224 159.5s224-71.5 224-159.5c0-7.7-1-15.5-2.7-22.7 57.6-31.6 36.9-117.2-27.5-117.2zM149 250.1c0-25.2 20.4-45.6 45.6-45.6s45.6 20.4 45.6 45.6-20.4 45.6-45.6 45.6-45.6-20.4-45.6-45.6zm226.9 116.5c-16 16-46.9 21.9-70.9 21.9s-54.9-5.9-70.9-21.9c-2.5-2.5-2.5-6.7 0-9.4 2.5-2.5 6.9-2.5 9.4 0 12.7 13 38.6 17.5 61.5 17.5s48.8-4.5 61.5-17.5c2.5-2.5 6.9-2.5 9.4 0 2.5 2.7 2.5 6.9 0 9.4zm-6.4-70.9c-25.2 0-45.6-20.4-45.6-45.6s20.4-45.6 45.6-45.6 45.6 20.4 45.6 45.6-20.4 45.6-45.6 45.6z" />
      </svg>
    ),
  },
  {
    key: 'pinterest',
    label: 'Pinterest',
    color: '#E60023',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0a12 12 0 0 0-4.373 23.178c-.017-.87-.003-1.912.216-2.857.238-1.008 1.581-6.695 1.581-6.695s-.403-.808-.403-2.002c0-1.875 1.088-3.275 2.443-3.275 1.15 0 1.706.865 1.706 1.901 0 1.157-.738 2.889-1.117 4.494-.32 1.35.674 2.451 1.999 2.451 2.4 0 4.24-2.53 4.24-6.181 0-3.232-2.32-5.49-5.633-5.49-3.838 0-6.09 2.883-6.09 5.86 0 1.161.446 2.404 1.006 3.083a.4.4 0 0 1 .093.386c-.101.421-.325 1.317-.37 1.5-.058.246-.192.298-.443.18-1.657-.771-2.693-3.19-2.693-5.135 0-4.181 3.037-8.02 8.757-8.02 4.6 0 8.174 3.278 8.174 7.658 0 4.567-2.879 8.24-6.877 8.24-1.343 0-2.605-.698-3.037-1.522l-.826 3.148c-.299 1.15-1.107 2.591-1.649 3.469A12 12 0 1 0 12 0z" />
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
      const sc = await getSiteSettings()
      if (sc) cfg = sc as Record<string, string>

      // Fallback to localStorage (admin's own device)
      if (!Object.values(cfg).some(Boolean)) {
        const local = getAdminConfig()
        cfg = {
          facebook:  local.facebook,
          youtube:   local.youtube,
          whatsapp:  local.whatsapp,
          twitter:   local.twitter,
          instagram: local.instagram,
          telegram:  local.telegram,
          reddit:    local.reddit,
          pinterest: local.pinterest,
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                textDecoration: 'none',
                transition: 'background 0.15s',
                minWidth: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-pale)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--white)' }}
            >
              {/* Platform icon */}
              <span
                style={{
                  width: '26px', height: '26px', borderRadius: '5px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: link.color, color: 'white', flexShrink: 0,
                }}
              >
                {link.icon}
              </span>
              {/* Platform name only — no raw URL shown */}
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dark)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
