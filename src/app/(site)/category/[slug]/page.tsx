import type { Metadata } from 'next'
import { getCategories, getCategoryBySlug } from '@/lib/db/categories'
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

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CategoryPageClient params={params} />
}
