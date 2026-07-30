export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getNewsBySlug, getNews } from '@/lib/db/news'
import { newsMetadata, newsJsonLd, breadcrumbJsonLd, BASE_URL, SITE_NAME } from '@/lib/seo'
import NewsDetail from './NewsDetail'
import GAContentView from '@/components/analytics/GAContentView'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getNewsBySlug(slug)
  if (!post) return { title: 'Story Not Found' }
  return newsMetadata(post)
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getNewsBySlug(slug)
  if (!post) notFound()

  const isJanaza = post.news_type === 'janaza'
  const sectionLabel = isJanaza ? 'Janaza News' : 'Special News'
  const sectionPath = isJanaza ? 'news?type=janaza' : 'news?type=special'

  const all = await getNews()
  const related = all.filter((n) => n.id !== post.id && n.news_type === post.news_type).slice(0, 3)
  const recent  = all.filter((n) => n.id !== post.id && n.news_type === post.news_type).slice(0, 4)

  const breadcrumbs = breadcrumbJsonLd([
    { name: SITE_NAME, url: BASE_URL },
    { name: sectionLabel, url: `${BASE_URL}/${sectionPath}` },
    { name: post.title, url: `${BASE_URL}/news/${post.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <GAContentView
        eventName="news_view"
        params={{
          news_slug:  post.slug,
          news_title: post.title,
          news_type:  post.news_type,
        }}
      />
      <NewsDetail post={post} related={related} recent={recent} />
    </>
  )
}

export async function generateStaticParams() {
  try {
    const { getNews } = await import('@/lib/db/news')
    const news = await getNews()
    return news.map((n) => ({ slug: n.slug }))
  } catch { return [] }
}
