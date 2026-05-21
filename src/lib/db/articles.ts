import { supabase } from '../supabase'
import { mockArticles } from '../mockData'
import { Article } from '../types'

export async function getArticles(): Promise<Article[]> {
  if (!supabase) return mockArticles
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
  if (error || !data) return mockArticles
  return data as Article[]
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!supabase) return mockArticles.find((a) => a.slug === slug) ?? null
  const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).single()
  if (error || !data) return null
  return data as Article
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (!supabase) return mockArticles.find((a) => a.id === id) ?? null
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as Article
}

export async function getFeaturedArticles(): Promise<Article[]> {
  if (!supabase) return mockArticles.filter((a) => a.is_featured)
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
  if (error || !data) return mockArticles.filter((a) => a.is_featured)
  return data as Article[]
}

export async function getRelatedArticles(id: string, category: string): Promise<Article[]> {
  if (!supabase) return mockArticles.filter((a) => a.id !== id && a.category === category).slice(0, 3)
  const { data, error } = await supabase
    .from('articles').select('*').eq('category', category).neq('id', id).limit(3)
  if (error || !data) return []
  return data as Article[]
}

export async function saveArticle(article: Partial<Article>): Promise<{ data: Article | null; error: string | null }> {
  if (!supabase) return { data: null, error: 'Supabase not configured' }
  if (article.id) {
    const { id, ...rest } = article
    const { data, error } = await supabase.from('articles').update(rest).eq('id', id).select().single()
    return { data: data as Article | null, error: error?.message ?? null }
  }
  const { data, error } = await supabase.from('articles').insert(article).select().single()
  return { data: data as Article | null, error: error?.message ?? null }
}

export async function deleteArticle(id: string): Promise<string | null> {
  if (!supabase) return 'Supabase not configured'
  const { error } = await supabase.from('articles').delete().eq('id', id)
  return error?.message ?? null
}

export async function toggleArticleFeatured(id: string, is_featured: boolean): Promise<string | null> {
  if (!supabase) return 'Supabase not configured'
  const { error } = await supabase.from('articles').update({ is_featured }).eq('id', id)
  return error?.message ?? null
}

export async function incrementArticleViews(id: string): Promise<void> {
  if (!supabase) return
  await supabase.rpc('increment_article_views', { article_id: id })
}
