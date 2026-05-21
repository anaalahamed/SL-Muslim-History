'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import NewsForm from '@/components/admin/NewsForm'
import { getNewsById, saveNews } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'
export default function PageClient() {
  const { id } = useParams<{ id: string }>()
  const [post,   setPost]   = useState<NewsPost | null | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  useEffect(() => {
    getNewsById(id).then((data) => setPost(data ?? null))
  }, [id])
  if (post === undefined) return <div className="text-center py-24 text-sm" style={{color:'#94a3b8'}}>Loading...</div>
  if (!post) notFound()
  async function handleSave(data: Partial<NewsPost>) {
    setSaving(true)
    const { error } = await saveNews({ ...data, id: post!.id })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }
  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
        <Link href="/admin" className="hover:text-green-700 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/news" className="hover:text-green-700 transition-colors">News</Link>
        <span>/</span>
        <span style={{ color: '#1e293b' }}>Edit Post</span>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Edit Post</h2>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#4a9e1f' }}>
              ✅ Saved successfully
            </span>
          )}
          <Link
            href={`/news/${post.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
          >
            ↗ View Live
          </Link>
        </div>
      </div>
      <NewsForm initial={post} onSave={handleSave} saving={saving} />
    </div>
  )
}
