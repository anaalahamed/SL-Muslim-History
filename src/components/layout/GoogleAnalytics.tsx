'use client'

import { useEffect } from 'react'
import { getAdminConfig } from '@/lib/adminConfig'

export default function GoogleAnalytics() {
  useEffect(() => {
    const { seo } = getAdminConfig()
    const gaId = seo?.googleAnalyticsId?.trim()
    if (!gaId) return
    if (document.getElementById('ga-script')) return

    const script1 = document.createElement('script')
    script1.id = 'ga-script'
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.id = 'ga-config'
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `
    document.head.appendChild(script2)
  }, [])

  return null
}
