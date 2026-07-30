export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getRelatedArticles } from '@/lib/db/articles'
import { getCategories } from '@/lib/db/categories'
import { articleMetadata, articleJsonLd, breadcrumbJsonLd, BASE_URL, SITE_NAME } from '@/lib/seo'
import ArticleDetail from './ArticleDetail'
import GAContentView from '@/components/analytics/GAContentView'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article Not Found' }
  return articleMetadata(article)
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const [related, categories] = await Promise.all([
    getRelatedArticles(article.id, article.category),
    getCategories(),
  ])

  const breadcrumbs = breadcrumbJsonLd([
    { name: SITE_NAME, url: BASE_URL },
    { name: 'Articles', url: `${BASE_URL}/articles` },
    { name: article.category, url: `${BASE_URL}/category/${article.category_slug}` },
    { name: article.title, url: `${BASE_URL}/articles/${article.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <GAContentView
        eventName="article_view"
        params={{
          article_slug:  article.slug,
          article_title: article.title,
          category:      article.category,
          author:        article.author,
        }}
      />
      <ArticleDetail article={article} related={related} categories={categories} />
    </>
  )
}

export async function generateStaticParams() {
  try {
    const { getArticles } = await import('@/lib/db/articles')
    const articles = await getArticles()
    return articles.map((a) => ({ slug: a.slug }))
  } catch { return [] }
}
