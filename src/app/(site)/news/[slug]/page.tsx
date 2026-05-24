import type { Metadata } from 'next'
import { getNewsBySlug } from '@/lib/db/news'
import NewsDetail from './NewsDetail'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getNewsBySlug(slug)
  if (!post) return { title: 'Story Not Found' }
  return {
    title: post.title,
    description: post.content?.split('\n\n')[0]?.slice(0, 160) ?? post.title,
    openGraph: {
      title: post.title,
      description: post.content?.split('\n\n')[0]?.slice(0, 160) ?? post.title,
      type: 'article',
      publishedTime: post.published_at,
      images: post.featured_image
        ? [{ url: post.featured_image, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content?.split('\n\n')[0]?.slice(0, 160) ?? post.title,
      images: post.featured_image ? [post.featured_image] : [],
    },
  }
}

export default function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <NewsDetail params={params} />
}

export async function generateStaticParams() {
  try {
    const { getNews } = await import('@/lib/db/news')
    const news = await getNews()
    return news.map((n) => ({ slug: n.slug }))
  } catch { return [] }
}
