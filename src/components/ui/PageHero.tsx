import AnimateIn from '@/components/ui/AnimateIn'

interface Props {
  badge: string
  title: string
  subtitle: string
}

export default function PageHero({ badge, title, subtitle }: Props) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0d2e1b 0%, #163522 55%, #0a2213 100%)',
        paddingTop: '52px',
        paddingBottom: '52px',
      }}
    >
      {/* Gold top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold) 30%, #f0d060 50%, var(--gold) 70%, transparent)' }} />

      {/* Soft glow — top right */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* Soft glow — bottom left */}
      <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,158,31,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Decorative arc — right side */}
      <div className="absolute right-0 top-0 bottom-0 pointer-events-none hidden md:block" style={{ width: '280px', opacity: 0.06 }}>
        <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <circle cx="280" cy="80" r="120" stroke="#c9a84c" strokeWidth="1" fill="none" />
          <circle cx="280" cy="80" r="80"  stroke="#c9a84c" strokeWidth="0.5" fill="none" />
          <circle cx="280" cy="80" r="40"  stroke="#c9a84c" strokeWidth="0.5" fill="none" />
          <line x1="160" y1="80" x2="280" y2="80" stroke="#c9a84c" strokeWidth="0.5" />
          <line x1="280" y1="0"  x2="280" y2="160" stroke="#c9a84c" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <AnimateIn direction="up">
          <div className="flex items-center gap-3 mb-3">
            {/* Gold vertical bar */}
            <div style={{ width: '3px', height: '36px', borderRadius: '9999px', background: 'var(--gold)', flexShrink: 0 }} />
            <div>
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}
              >
                {badge}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mt-0.5">
                {title}
              </h1>
            </div>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '540px', paddingLeft: '15px' }}
          >
            {subtitle}
          </p>
        </AnimateIn>
      </div>

      {/* Gold bottom border */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3) 50%, transparent)' }} />
    </div>
  )
}
