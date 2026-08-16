'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Advertisement } from '@/lib/types'
import GoogleAdUnit from '@/components/ui/GoogleAdUnit'

interface Props {
  // Pass this when the parent already fetched it server-side (the homepage
  // does). Omit it and the component fetches it itself on mount, same as
  // before — used by pages like ArticleDetail that render this client-side.
  // Only actually used when the admin has switched this slot to "manual"
  // (Settings → Ads → Between News) — the default is the Google ad below.
  ad?: Advertisement | null
}

export default function SidebarAd({ ad: adProp }: Props) {
  const [fetched, setFetched] = useState<Advertisement | null>(null)
  // Defaults to 'google' (matches what's live) until the admin's saved
  // choice loads, so most visitors never see a flash of the wrong source.
  const [source, setSource] = useState<'google' | 'manual'>('google')

  useEffect(() => {
    import('@/lib/db/siteSettings').then(({ getSiteSettings }) =>
      getSiteSettings().then((s) => {
        if (s?.adSlotSource?.betweenNews === 'manual') setSource('manual')
      })
    )
  }, [])

  useEffect(() => {
    if (adProp !== undefined) return
    // Dynamically imported so the (client-only) fallback fetch path doesn't
    // pull the full @supabase/supabase-js SDK — auth module included — into
    // the initial JS of every page that renders this component.
    import('@/lib/db/ads').then(({ getSidebarAd }) => getSidebarAd().then(setFetched))
  }, [adProp])

  if (source === 'google') {
    return (
      <div style={{ marginBottom: '0' }}>
        <div style={{ fontSize: '9px', color: 'var(--muted)', textAlign: 'right', marginBottom: '3px', letterSpacing: '.05em', textTransform: 'uppercase' }}>
          Advertisement
        </div>
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          overflow: 'hidden',
          minHeight: '100px',
          maxWidth: '500px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <GoogleAdUnit slot="2240722313" style={{ width: '100%', minHeight: '100px' }} />
        </div>
      </div>
    )
  }

  const ad = adProp !== undefined ? adProp : fetched

  if (!ad) return null

  const inner = (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: '3px',
      overflow: 'hidden',
      // Fixed aspect ratio (not just a height range) so the same ad image
      // is framed identically everywhere this appears, regardless of how
      // wide the surrounding sidebar column happens to be on that page.
      aspectRatio: '5 / 2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {ad.image_url ? (
        <Image
          src={ad.image_url}
          alt={ad.title}
          fill
          sizes="(max-width: 900px) 100vw, 300px"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dark)' }}>{ad.title}</p>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Advertisement</p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ marginBottom: '0' }}>
      <div style={{ fontSize: '9px', color: 'var(--muted)', textAlign: 'right', marginBottom: '3px', letterSpacing: '.05em', textTransform: 'uppercase' }}>
        Advertisement
      </div>
      {ad.link_url ? (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block' }}>
          {inner}
        </a>
      ) : inner}
    </div>
  )
}
