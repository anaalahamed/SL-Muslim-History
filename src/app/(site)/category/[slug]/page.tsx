export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories, getCategoryBySlug } from '@/lib/db/categories'
import { getArticles } from '@/lib/db/articles'
import { getAds } from '@/lib/db/ads'
import { categoryMetadata } from '@/lib/seo'
import CategoryPageClient from './CategoryPageClient'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }
  return categoryMetadata(category.name_en, category.name_ta, slug)
}

export async function generateStaticParams() {
  try {
    const cats = await getCategories()
    return cats.map((c) => ({ slug: c.slug }))
  } catch { return [{ slug: 'early-history' }] }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetched server-side (this route is already force-dynamic) so the
  // article list and sidebar ad are present in the initial HTML instead
  // of the whole page starting as a skeleton and client-fetching
  // everything after hydration.
  const [category, allArticles, allCategories, sidebarAds] = await Promise.all([
    getCategoryBySlug(slug),
    getArticles(),
    getCategories(),
    getAds('sidebar'),
  ])

  if (!category) notFound()

  const articles = allArticles.filter((a) => a.category_slug === slug)

  return <CategoryPageClient category={category} articles={articles} allCategories={allCategories} sidebarAds={sidebarAds} />
}
