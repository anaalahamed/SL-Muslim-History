import GoogleAdUnit from '@/components/ui/GoogleAdUnit'
import { Advertisement } from '@/lib/types'

interface Props {
  // Kept for backward compatibility with existing callers (e.g. the
  // homepage passes a server-fetched ad here) — no longer used since this
  // slot ("Between News", ad position #1) now always shows the Google
  // AdSense unit the site owner set up for this exact spot.
  ad?: Advertisement | null
}

export default function SidebarAd(_props: Props) {
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <GoogleAdUnit slot="2240722313" style={{ width: '100%', minHeight: '100px' }} />
      </div>
    </div>
  )
}
