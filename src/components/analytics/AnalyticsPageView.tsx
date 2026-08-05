'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Reads the query string via window.location instead of next/navigation's
// useSearchParams() specifically to avoid that hook's Suspense-boundary
// requirement — this component used to be wrapped in <Suspense> in the
// root layout purely to satisfy that, and Next's streaming-SSR <template>
// marker for that boundary was the confirmed cause of a large, reproducible
// layout-shift on every page (see the commit removing (site)/loading.tsx
// for the full trace). usePathname() alone has no such requirement.
export default function AnalyticsPageView() {
  const pathname = usePathname()

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return
    window.gtag('config', GA_ID, { page_path: pathname + window.location.search })
  }, [pathname])

  return null
}
