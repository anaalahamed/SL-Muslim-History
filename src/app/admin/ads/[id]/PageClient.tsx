'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdForm from '@/components/admin/AdForm'
import { saveAd, getAllAds } from '@/lib/db/ads'
import { Advertisement } from '@/lib/types'
export default function EditAdPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [ad,     setAd]     = useState<Advertisement | null>(null)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  useEffect(() => {
    getAllAds().then((all) => {
      const found = all.find((a) => a.id === id) ?? null
      setAd(found)
    })
  }, [id])
  async function handleSave(data: Partial<Advertisement>) {
    setSaving(true)
    setError(null)
    const { error } = await saveAd({ ...data, id })
    setSaving(false)
    if (error) { setError(error); return }
    router.push('/admin/ads')
  }
  if (!ad) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#4a9e1f', borderTopColor: 'transparent' }} />
    </div>
  )
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Edit Advertisement</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{ad.title}</p>
      </div>
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      <AdForm initial={ad} onSave={handleSave} saving={saving} />
    </div>
  )
}
