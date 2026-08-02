// Shared dark/neon design tokens for the admin panel — one place to tweak
// the look so every admin page stays visually consistent as it's redone.

import type { CSSProperties } from 'react'

export const theme = {
  pageBg: '#0a0e17',
  pageBgLayers:
    'radial-gradient(circle at 15% 0%, rgba(139,92,246,0.10), transparent 40%), ' +
    'radial-gradient(circle at 85% 15%, rgba(59,130,246,0.08), transparent 40%), ' +
    'radial-gradient(circle at 50% 100%, rgba(236,72,153,0.06), transparent 45%), ' +
    '#0a0e17',
  sidebarBg: 'linear-gradient(180deg, #0d1220 0%, #080b13 100%)',
  card: 'rgba(255,255,255,0.035)',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardHoverBorder: 'rgba(139,92,246,0.4)',
  divider: 'rgba(255,255,255,0.07)',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
} as const

export const accents = {
  violet:  { solid: '#a78bfa', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', glow: 'rgba(139,92,246,0.4)', soft: 'rgba(139,92,246,0.12)' },
  blue:    { solid: '#60a5fa', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', glow: 'rgba(59,130,246,0.4)', soft: 'rgba(59,130,246,0.12)' },
  pink:    { solid: '#f472b6', grad: 'linear-gradient(135deg,#ec4899,#be185d)', glow: 'rgba(236,72,153,0.4)', soft: 'rgba(236,72,153,0.12)' },
  cyan:    { solid: '#22d3ee', grad: 'linear-gradient(135deg,#06b6d4,#0e7490)', glow: 'rgba(6,182,212,0.4)', soft: 'rgba(6,182,212,0.12)' },
  amber:   { solid: '#fbbf24', grad: 'linear-gradient(135deg,#f59e0b,#b45309)', glow: 'rgba(245,158,11,0.4)', soft: 'rgba(245,158,11,0.12)' },
  emerald: { solid: '#34d399', grad: 'linear-gradient(135deg,#10b981,#047857)', glow: 'rgba(16,185,129,0.4)', soft: 'rgba(16,185,129,0.12)' },
  rose:    { solid: '#fb7185', grad: 'linear-gradient(135deg,#f43f5e,#be123c)', glow: 'rgba(244,63,94,0.4)', soft: 'rgba(244,63,94,0.12)' },
} as const

export type AccentKey = keyof typeof accents

// Standard card shell used across admin panels
export const cardStyle: CSSProperties = {
  background: theme.card,
  border: theme.cardBorder,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}
