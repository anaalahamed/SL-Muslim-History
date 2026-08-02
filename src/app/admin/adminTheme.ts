// Shared bright/colorful design tokens for the admin panel — one place to
// tweak the look so every admin page stays visually consistent as it's redone.

import type { CSSProperties } from 'react'

export const theme = {
  pageBg: '#f8fafc',
  pageBgLayers:
    'radial-gradient(circle at 10% 0%, rgba(139,92,246,0.07), transparent 40%), ' +
    'radial-gradient(circle at 90% 10%, rgba(59,130,246,0.06), transparent 40%), ' +
    'radial-gradient(circle at 50% 100%, rgba(236,72,153,0.05), transparent 45%), ' +
    '#f8fafc',
  sidebarBg: 'linear-gradient(165deg, #7c3aed 0%, #6366f1 45%, #ec4899 100%)',
  card: '#ffffff',
  cardBorder: '1px solid #eef2f7',
  cardHoverBorder: 'rgba(139,92,246,0.35)',
  divider: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
} as const

export const accents = {
  violet:  { solid: '#7c3aed', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', glow: 'rgba(139,92,246,0.28)', soft: '#f3eeff' },
  blue:    { solid: '#2563eb', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', glow: 'rgba(59,130,246,0.28)', soft: '#eaf1ff' },
  pink:    { solid: '#db2777', grad: 'linear-gradient(135deg,#ec4899,#be185d)', glow: 'rgba(236,72,153,0.28)', soft: '#fdeef6' },
  cyan:    { solid: '#0891b2', grad: 'linear-gradient(135deg,#06b6d4,#0e7490)', glow: 'rgba(6,182,212,0.28)', soft: '#eafbff' },
  amber:   { solid: '#d97706', grad: 'linear-gradient(135deg,#f59e0b,#b45309)', glow: 'rgba(245,158,11,0.28)', soft: '#fef6e7' },
  emerald: { solid: '#059669', grad: 'linear-gradient(135deg,#10b981,#047857)', glow: 'rgba(16,185,129,0.28)', soft: '#e9fbf3' },
  rose:    { solid: '#e11d48', grad: 'linear-gradient(135deg,#f43f5e,#be123c)', glow: 'rgba(244,63,94,0.28)', soft: '#feedf0' },
} as const

export type AccentKey = keyof typeof accents

// Standard card shell used across admin panels
export const cardStyle: CSSProperties = {
  background: theme.card,
  border: theme.cardBorder,
  boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
}
