import type { Metadata } from 'next'
import { getNewsBySlug } from '@/lib/db/news'
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

  const isJanaza = post?.news_type === 'janaza'
  const sectionLabel = isJanaza ? 'Janaza News' : 'Special News'
  const sectionPath = isJanaza ? 'news?type=janaza' : 'news?type=special'

  const breadcrumbs = post
    ? breadcrumbJsonLd([
        { name: SITE_NAME, url: BASE_URL },
        { name: sectionLabel, url: `${BASE_URL}/${sectionPath}` },
        { name: post.title, url: `${BASE_URL}/news/${post.slug}` },
      ])
    : null

  return (
    <>
      {post && (
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
        </>
      )}
      <NewsDetail params={params} />
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
