// Server component wrapper — provides generateStaticParams for static export
import { getCategories } from '@/lib/db/categories'
import CategoryPageClient from './CategoryPageClient'

export async function generateStaticParams() {
  try {
    const cats = await getCategories()
    return cats.map((c) => ({ slug: c.slug }))
  } catch { return [{ slug: 'early-history' }] }
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CategoryPageClient params={params} />
}
