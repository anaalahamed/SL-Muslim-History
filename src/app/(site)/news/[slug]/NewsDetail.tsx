'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import { getNewsBySlug, getNews } from '@/lib/db/news'
import { NewsPost } from '@/lib/types'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import AnimateIn from '@/components/ui/AnimateIn'
import RichContent from '@/components/ui/RichContent'
import { DetailPageSkeleton } from '@/components/ui/Skeleton'
import ReadingProgress from '@/components/ui/ReadingProgress'
import AdBanner from '@/components/ui/AdBanner'

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Community:  { bg: '#dcfce7', text: '#15803d' },
  Heritage:   { bg: '#fef9c3', text: '#a16207' },
  Education:  { bg: '#dbeafe', text: '#1d4ed8' },
  Literature: { bg: '#f3e8ff', text: '#7c3aed' },
}

export default function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [post, setPost] = useState<NewsPost | null | undefined>(undefined)
  const [related, setRelated] = useState<NewsPost[]>([])
  const [recent, setRecent] = useState<NewsPost[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getNewsBySlug(slug).then((data) => {
      setPost(data ?? null)
      if (data) {
        getNews().then((all) => {
          setRelated(all.filter((n) => n.id !== data.id && n.category === data.category).slice(0, 3))
          setRecent(all.filter((n) => n.id !== data.id).slice(0, 4))
        })
      }
    })
  }, [slug])

  if (post === undefined) return <DetailPageSkeleton />
  if (!post) notFound()

  const pageUrl     = typeof window !== 'undefined' ? window.location.href : `https://srilankamuslimhistory.com/news/${slug}`
  const encodedUrl   = encodeURIComponent(pageUrl)
  const encodedTitle = encodeURIComponent(post.title)

  function handleShare(platform: string) {
    if (platform === 'Facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400')
    } else if (platform === 'WhatsApp') {
      window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank')
    } else if (platform === 'Twitter/X') {
      window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank', 'width=600,height=400')
    } else if (platform === 'Copy Link') {
      navigator.clipboard.writeText(pageUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }


  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <ReadingProgress />

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d2e1b 0%, #163522 55%, #0a2213 100%)', paddingTop: '48px', paddingBottom: '48px' }}
      >
        {/* Gold top border */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold) 30%, #f0d060 50%, var(--gold) 70%, transparent)' }} />
        {/* Glow top-right */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Glow bottom-left */}
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,158,31,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Decorative arc right */}
        <div className="absolute right-0 top-0 bottom-0 pointer-events-none hidden md:block" style={{ width: '280px', opacity: 0.05 }}>
          <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <circle cx="280" cy="80" r="120" stroke="#c9a84c" strokeWidth="1" fill="none" />
            <circle cx="280" cy="80" r="80" stroke="#c9a84c" strokeWidth="0.5" fill="none" />
            <circle cx="280" cy="80" r="40" stroke="#c9a84c" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-white">
          <AnimateIn direction="up">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
              <Link href="/news" className="hover:text-white transition-colors">News</Link>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
              <span style={{ color: 'var(--gold)' }}>{post.category}</span>
            </div>

            {/* Gold bar + badges */}
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: '3px', height: '32px', borderRadius: '9999px', background: 'var(--gold)', flexShrink: 0 }} />
              {post.is_breaking && (
                <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: '#dc2626', color: 'white' }}>
                  🔴 Breaking
                </span>
              )}
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: categoryStyle[post.category]?.bg ?? 'rgba(255,255,255,0.1)', color: categoryStyle[post.category]?.text ?? 'rgba(255,255,255,0.85)' }}>
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="tamil-heading font-extrabold text-2xl md:text-3xl text-white mb-5" style={{ lineHeight: '1.45', maxWidth: '680px' }}>
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span>{formatDate(post.published_at)}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>SL Muslim History</span>
            </div>
          </AnimateIn>
        </div>
        {/* Gold bottom border */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3) 50%, transparent)' }} />
      </div>


      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* News body */}
          <div className="flex-1 min-w-0">
            <AnimateIn direction="up">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'white' }}
              >
                {/* News hero — fixed 4:3 */}
                {post.featured_image ? (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      priority
                      sizes="(max-width: 1280px) 100vw, 896px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    className="h-64 md:h-72 flex items-center justify-center text-7xl"
                    style={{ background: 'var(--green-light)' }}
                  >
                    📰
                  </div>
                )}

                {/* Content */}
                <div className="p-6 md:p-10">
                  {/* Lead excerpt */}
                  <p
                    className="tamil-text text-base leading-loose mb-8 pb-8"
                    style={{
                      color: 'var(--dark)',
                      borderBottom: '2px solid var(--green-light)',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                    }}
                  >
                    {post.excerpt}
                  </p>

                  {/* Body */}
                  {post.content?.trim() ? (
                    <RichContent content={post.content} />
                  ) : (
                    <div
                      className="text-center py-16 rounded-xl"
                      style={{ background: 'var(--green-light)' }}
                    >
                      <div className="text-4xl mb-3">📝</div>
                      <p className="font-semibold" style={{ color: 'var(--dark)' }}>Full story coming soon</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Check back shortly for the full report.</p>
                    </div>
                  )}
                </div>

                {/* Footer bar */}
                <div
                  className="px-6 md:px-10 py-5 flex items-center justify-between flex-wrap gap-4"
                  style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
                >
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                    <span>📅 Published {formatDate(post.published_at)}</span>
                    <span>·</span>
                    <span>SL Muslim History Editorial</span>
                  </div>
                  <Link
                    href="/news"
                    className="text-sm font-semibold px-5 py-2 rounded-xl transition-all"
                    style={{
                      background: 'var(--green-light)',
                      color: 'var(--green)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--green)'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--green-light)'
                      e.currentTarget.style.color = 'var(--green)'
                    }}
                  >
                    ← Back to News
                  </Link>
                </div>
              </div>
            </AnimateIn>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="space-y-6 lg:sticky lg:top-6">

              {/* Related news */}
              {related.length > 0 && (
                <AnimateIn direction="right" delay={100}>
                  <div
                    className="rounded-2xl p-5"
                    style={{ border: '1px solid var(--border)', background: 'white' }}
                  >
                    <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--dark)' }}>
                      <span className="w-1 h-5 rounded-full inline-block" style={{ background: '#dc2626' }} />
                      Related Stories
                    </h3>
                    <div className="space-y-3">
                      {related.map((item) => (
                        <Link
                          key={item.id}
                          href={`/news/${item.slug}`}
                          className="flex gap-3 p-3 rounded-xl transition-all"
                          style={{ border: '1px solid var(--border)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--green)'
                            e.currentTarget.style.background = 'var(--green-light)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <div
                            className="relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden"
                            style={{ background: 'var(--green-light)' }}
                          >
                            {item.featured_image ? (
                              <Image src={item.featured_image} alt={item.title} fill sizes="48px" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-2xl">📰</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            {item.is_breaking && (
                              <span
                                className="inline-block text-xs font-bold px-1.5 py-0.5 rounded mb-1"
                                style={{ background: '#fee2e2', color: '#b91c1c' }}
                              >
                                Breaking
                              </span>
                            )}
                            <p
                              className="tamil-heading text-xs font-semibold line-clamp-2"
                              style={{ color: 'var(--dark)', lineHeight: '1.6' }}
                            >
                              {item.title}
                            </p>
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>
                              {formatDate(item.published_at)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </AnimateIn>
              )}

              {/* Recent news */}
              <AnimateIn direction="right" delay={200}>
                <div
                  className="rounded-2xl p-5"
                  style={{ border: '1px solid var(--border)', background: 'white' }}
                >
                  <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--dark)' }}>
                    <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
                    Recent News
                  </h3>
                  <div className="space-y-3">
                    {recent.map((item, i) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.slug}`}
                        className="flex items-start gap-3 transition-all group"
                        style={{ paddingBottom: i < recent.length - 1 ? '12px' : '0', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}
                      >
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mt-0.5"
                          style={{ background: i === 0 ? 'var(--green)' : 'var(--bg)', color: i === 0 ? 'white' : 'var(--muted)' }}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p
                            className="tamil-heading text-xs font-semibold line-clamp-2 group-hover:text-green-700 transition-colors"
                            style={{ color: 'var(--dark)', lineHeight: '1.6' }}
                          >
                            {item.title}
                          </p>
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>
                            {formatDate(item.published_at)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/news"
                    className="block text-center text-xs font-bold mt-4 py-2 rounded-xl transition-all"
                    style={{ background: 'var(--green-light)', color: 'var(--green)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green-light)'; e.currentTarget.style.color = 'var(--green)' }}
                  >
                    View all news →
                  </Link>
                </div>
              </AnimateIn>

              {/* Share */}
              <AnimateIn direction="right" delay={300}>
                <div
                  className="rounded-2xl p-5"
                  style={{ border: '1px solid var(--border)', background: 'white' }}
                >
                  <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--dark)' }}>
                    <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
                    Share This Story
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: 'Facebook', bg: '#1877f2',
                        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>,
                      },
                      {
                        label: 'WhatsApp', bg: '#25d366',
                        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
                      },
                      {
                        label: 'Twitter/X', bg: '#000000',
                        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                      },
                      {
                        label: copied ? 'Copied!' : 'Copy Link',
                        bg: copied ? '#15803d' : 'var(--green)',
                        icon: copied ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20 6L9 17l-5-5"/></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        ),
                      },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handleShare(copied && btn.label === 'Copied!' ? 'Copy Link' : btn.label)}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                        style={{ background: btn.bg, opacity: 0.9 }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        {btn.icon}
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AnimateIn>

              {/* Ad banner */}
              <AdBanner position="sidebar" />

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
