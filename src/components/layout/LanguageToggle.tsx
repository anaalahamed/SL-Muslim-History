'use client'

import { useEffect, useState } from 'react'

// Reads whether Google Translate has already switched this page to
// English, via the `googtrans` cookie its own script also reads on load.
function getCurrentLang(): 'ta' | 'en' {
  if (typeof document === 'undefined') return 'ta'
  return document.cookie.includes('googtrans=/ta/en') ? 'en' : 'ta'
}

function setLang(lang: 'ta' | 'en') {
  const host = window.location.hostname
  if (lang === 'en') {
    document.cookie = 'googtrans=/ta/en;path=/'
    document.cookie = `googtrans=/ta/en;path=/;domain=${host}`
  } else {
    document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = `googtrans=;path=/;domain=${host};expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
  // A full reload is the reliable way to apply this — Google's widget
  // reads the cookie once, on page load, to decide whether to translate.
  window.location.reload()
}

export default function LanguageToggle() {
  const [lang, setLangState] = useState<'ta' | 'en'>('ta')

  useEffect(() => { setLangState(getCurrentLang()) }, [])

  const activeStyle = { background: 'var(--gold)', color: 'white' }
  const inactiveStyle = { background: 'transparent', color: 'var(--dark)' }

  return (
    <div
      className="notranslate flex-shrink-0 flex items-center"
      style={{ border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}
      role="group"
      aria-label="Language"
    >
      <button
        onClick={() => lang !== 'ta' && setLang('ta')}
        className="font-bold px-2 py-2 md:px-3 md:py-2 text-xs transition-all"
        style={lang === 'ta' ? activeStyle : inactiveStyle}
        aria-pressed={lang === 'ta'}
      >
        <span className="hidden md:inline">தமிழ்</span>
        <span className="md:hidden">த</span>
      </button>
      <button
        onClick={() => lang !== 'en' && setLang('en')}
        className="font-bold px-2 py-2 md:px-3 md:py-2 text-xs transition-all"
        style={lang === 'en' ? activeStyle : inactiveStyle}
        aria-pressed={lang === 'en'}
      >
        <span className="hidden md:inline">English</span>
        <span className="md:hidden">En</span>
      </button>
    </div>
  )
}
