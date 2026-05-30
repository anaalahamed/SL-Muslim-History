import type { Metadata } from 'next'
import { getArticleBySlug } from '@/lib/db/articles'
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

  const breadcrumbs = article
    ? breadcrumbJsonLd([
        { name: SITE_NAME, url: BASE_URL },
        { name: 'Articles', url: `${BASE_URL}/articles` },
        { name: article.category, url: `${BASE_URL}/category/${article.category_slug}` },
        { name: article.title, url: `${BASE_URL}/articles/${article.slug}` },
      ])
    : null

  return (
    <>
      {article && (
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
        </>
      )}
      <ArticleDetail params={params} />
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
