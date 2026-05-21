'use client'

import { useEffect, useState } from 'react'

export default function IslamicDate() {
  const [hijri, setHijri] = useState('')
  const [gregorian, setGregorian] = useState('')

  useEffect(() => {
    const today = new Date()

    // Gregorian
    setGregorian(
      today.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    )

    // Hijri using built-in Intl API
    try {
      setHijri(
        new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(today)
      )
    } catch {
      setHijri('')
    }
  }, [])

  if (!hijri) return null

  return (
    <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
      <span className="flex items-center gap-1.5">
        <span style={{ color: 'var(--gold)' }}>☪</span>
        <span>{hijri}</span>
      </span>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
      <span>{gregorian}</span>
    </div>
  )
}
