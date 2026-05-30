import { supabase } from '../supabase'
import { mockCategories } from '../mockData'
import { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return mockCategories.map((c) => ({ ...c, parent_id: null }))

  const [{ data: cats, error }, { data: articleRows }] = await Promise.all([
    supabase.from('categories').select('*').order('name_en', { ascending: true }),
    supabase.from('articles').select('category_slug'),
  ])

  if (error || !cats) return mockCategories.map((c) => ({ ...c, parent_id: null }))

  // Build a count map from live article data
  const countMap: Record<string, number> = {}
  for (const row of (articleRows ?? [])) {
    if (row.category_slug) countMap[row.category_slug] = (countMap[row.category_slug] ?? 0) + 1
  }

  return cats.map((cat) => ({ ...cat, article_count: countMap[cat.slug] ?? 0 })) as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!supabase) {
    const found = mockCategories.find((c) => c.slug === slug)
    return found ? { ...found, parent_id: null } : null
  }
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (error || !data) return null
  return data as Category
}

export async function getTopLevelCategories(): Promise<Category[]> {
  const all = await getCategories()
  return all.filter((c) => !c.parent_id)
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const all = await getCategories()
  return all.filter((c) => c.parent_id === parentId)
}

export async function saveCategory(cat: Partial<Category>): Promise<{ data: Category | null; error: string | null }> {
  if (!supabase) return { data: null, error: 'Supabase not configured' }
  if (cat.id) {
    const { id, ...rest } = cat
    const { data, error } = await supabase.from('categories').update(rest).eq('id', id).select().single()
    return { data: data as Category | null, error: error?.message ?? null }
  }
  const { data, error } = await supabase.from('categories').insert(cat).select().single()
  return { data: data as Category | null, error: error?.message ?? null }
}

export async function deleteCategory(id: string): Promise<string | null> {
  if (!supabase) return 'Supabase not configured'
  const { error } = await supabase.from('categories').delete().eq('id', id)
  return error?.message ?? null
}
