'use client'

import { Advertisement } from '@/lib/types'

interface Props {
  ads: Advertisement[]
}

export default function SidePanelAdClient({ ads }: Props) {
  return (
    <div style={{
      position: 'sticky',
      /*
       * Header height breakdown (all sticky):
       *   utility bar  ~36px
       *   masthead     ~52px
       *   nav bar      ~48px
       *   total        ~136px
       * top: 140px gives 4px clearance below the sticky header.
       */
      top: '140px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      width: '160px',
    }}>
      <span style={{
        fontSize: 9, fontWeight: 800, color: '#b0b8c1',
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        Advertisement
      </span>

      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.link_url || undefined}
          target={ad.link_url ? '_blank' : undefined}
          rel="noopener noreferrer sponsored"
          style={{ display: 'block', width: '160px', textDecoration: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image_url}
            alt={ad.title}
            width={160}           /* reserves horizontal space — prevents CLS */
            loading="lazy"        /* defer off-screen images */
            decoding="async"      /* non-blocking image decode */
            style={{
              width: '160px',
              height: 'auto',     /* preserves image aspect ratio */
              display: 'block',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.88'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          />
        </a>
      ))}
    </div>
  )
}
