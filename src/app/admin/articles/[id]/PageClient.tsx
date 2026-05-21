'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArticleForm from '@/components/admin/ArticleForm'
import { getArticleById, saveArticle } from '@/lib/db/articles'
import { Article } from '@/lib/types'
export default function PageClient() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [article, setArticle] = useState<Article | null | undefined>(undefined)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  useEffect(() => {
    getArticleById(id).then((data) => setArticle(data ?? null))
  }, [id])
  if (article === undefined) return <div className="text-center py-24 text-sm" style={{color:'#94a3b8'}}>Loading...</div>
  if (!article) notFound()
  async function handleSave(data: Partial<Article>) {
    setSaving(true)
    const { error } = await saveArticle({ ...data, id: article!.id })
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
        <Link href="/admin/articles" className="hover:text-green-700 transition-colors">Articles</Link>
        <span>/</span>
        <span style={{ color: '#1e293b' }}>Edit Article</span>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Edit Article</h2>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#4a9e1f' }}>
              ✅ Saved successfully
            </span>
          )}
          <Link
            href={`/articles/${article.slug}`}
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
      <ArticleForm initial={article} onSave={handleSave} saving={saving} />
    </div>
  )
}
