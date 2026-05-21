'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const el  = document.documentElement
      const top  = el.scrollTop  || document.body.scrollTop
      const full = el.scrollHeight - el.clientHeight
      setProgress(full > 0 ? Math.min(100, (top / full) * 100) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-0.5 transition-all duration-100 ease-out"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--green) 0%, var(--gold) 100%)',
        boxShadow: progress > 0 ? '0 0 8px rgba(74,158,31,0.5)' : 'none',
      }}
      aria-hidden="true"
    />
  )
}
