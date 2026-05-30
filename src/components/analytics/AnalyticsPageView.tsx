'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function AnalyticsPageView() {
  const pathname  = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return
    const url = searchParams.size
      ? `${pathname}?${searchParams.toString()}`
      : pathname
    window.gtag('config', GA_ID, { page_path: url })
  }, [pathname, searchParams])

  return null
}
