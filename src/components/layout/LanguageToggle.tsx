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
    // 1 year — once a visitor picks English, it should stay English on
    // their next visit too, not just for this one browser session.
    const oneYear = 'max-age=31536000'
    document.cookie = `googtrans=/ta/en;path=/;${oneYear}`
    document.cookie = `googtrans=/ta/en;path=/;domain=${host};${oneYear}`
  } else {
    // Switching back to Tamil doesn't translate anything — it just clears
    // this cookie so Google's script does nothing at all, and the page
    // shows its real, original Tamil content straight away.
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

  const activeStyle = { background: 'var(--green)', color: 'white' }
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
        className="font-bold px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs transition-all"
        style={lang === 'ta' ? activeStyle : inactiveStyle}
        aria-pressed={lang === 'ta'}
      >
        <span className="hidden md:inline">தமிழ்</span>
        <span className="md:hidden">த</span>
      </button>
      <button
        onClick={() => lang !== 'en' && setLang('en')}
        className="font-bold px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs transition-all"
        style={lang === 'en' ? activeStyle : inactiveStyle}
        aria-pressed={lang === 'en'}
      >
        <span className="hidden md:inline">English</span>
        <span className="md:hidden">En</span>
      </button>
    </div>
  )
}
