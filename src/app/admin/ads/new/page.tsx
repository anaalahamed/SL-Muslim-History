'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdForm from '@/components/admin/AdForm'
import { saveAd } from '@/lib/db/ads'
import { Advertisement } from '@/lib/types'

export default function NewAdPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  async function handleSave(data: Partial<Advertisement>) {
    setSaving(true)
    setError(null)
    const { error } = await saveAd(data)
    setSaving(false)
    if (error) { setError(error); return }
    router.push('/admin/ads')
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>New Advertisement</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Upload a banner image and configure placement</p>
      </div>
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      <AdForm onSave={handleSave} saving={saving} />
    </div>
  )
}
