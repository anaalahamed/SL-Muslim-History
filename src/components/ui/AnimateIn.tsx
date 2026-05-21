'use client'

import { useInView } from '@/lib/useInView'
import { CSSProperties, ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'scale' | 'fade'
  className?: string
  style?: CSSProperties
}

export default function AnimateIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  style = {},
}: Props) {
  const { ref, inView } = useInView()

  const base: CSSProperties = {
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    willChange: 'opacity, transform',
  }

  const hidden: Record<string, CSSProperties> = {
    up:    { opacity: 0, transform: 'translateY(28px)' },
    left:  { opacity: 0, transform: 'translateX(-28px)' },
    right: { opacity: 0, transform: 'translateX(28px)' },
    scale: { opacity: 0, transform: 'scale(0.93)' },
    fade:  { opacity: 0, transform: 'none' },
  }

  const visible: CSSProperties = { opacity: 1, transform: 'none' }

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...base, ...(inView ? visible : hidden[direction]), ...style }}
    >
      {children}
    </div>
  )
}
