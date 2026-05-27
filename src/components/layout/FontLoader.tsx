'use client'

import { useEffect } from 'react'

// Full Google Fonts URL — loaded AFTER hydration so it never blocks rendering
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700' +
  '&family=Lato:wght@400;700;900' +
  '&family=Noto+Sans+Tamil:wght@400;500;600;700;800' +
  '&display=swap'

export default function FontLoader() {
  useEffect(() => {
    // Skip if already injected (e.g. hot reload)
    if (document.querySelector(`link[data-font-loader]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_URL
    link.setAttribute('data-font-loader', '1')
    document.head.appendChild(link)
  }, [])
  return null
}
