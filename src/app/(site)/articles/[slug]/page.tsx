import type { Metadata } from 'next'
import { getArticleBySlug } from '@/lib/db/articles'
import ArticleDetail from './ArticleDetail'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article Not Found' }
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.published_at,
      images: article.featured_image
        ? [{ url: article.featured_image, width: 1200, height: 630, alt: article.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
    },
  }
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticleDetail params={params} />
}

export async function generateStaticParams() {
  try {
    const { getArticles } = await import('@/lib/db/articles')
    const articles = await getArticles()
    return articles.map((a) => ({ slug: a.slug }))
  } catch { return [] }
}
