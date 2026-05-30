'use client'

import { useEffect } from 'react'

interface Props {
  eventName: string
  params: Record<string, string | number | boolean>
}

export default function GAContentView({ eventName, params }: Props) {
  useEffect(() => {
    if (typeof window.gtag !== 'function') return
    window.gtag('event', eventName, params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
