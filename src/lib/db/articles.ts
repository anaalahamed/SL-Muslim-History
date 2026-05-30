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

// Fetch only the N most recent articles — used by HeroSlider
export async function getRecentArticles(limit: number): Promise<Article[]> {
  if (!supabase) return mockArticles.slice(0, limit)
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error || !data) return mockArticles.slice(0, limit)
  return data as Article[]
}

// Fetch top-N articles by view count at the DB level — used by MostRead
export async function getMostReadArticles(limit: number): Promise<Article[]> {
  if (!supabase) {
    return [...mockArticles]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, limit)
  }
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('views', { ascending: false })
    .limit(limit)
  if (error || !data) return [...mockArticles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, limit)
  return data as Article[]
}

// DB-level paginated fetch of non-featured articles — used by AllArticles
export async function getArticlesPaginated(
  page: number,
  limit: number,
): Promise<{ articles: Article[]; total: number }> {
  if (!supabase) {
    const nf = mockArticles.filter((a) => !a.is_featured)
    return {
      articles: nf.slice((page - 1) * limit, page * limit),
      total: nf.length,
    }
  }
  const from = (page - 1) * limit
  const to = from + limit - 1
  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .or('is_featured.is.null,is_featured.eq.false')
    .order('published_at', { ascending: false })
    .range(from, to)
  if (error || !data) return { articles: [], total: 0 }
  return { articles: data as Article[], total: count ?? 0 }
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
    .from('articles').select('*').eq('category', category).neq('id', id)
    .order('published_at', { ascending: false }).limit(3)
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
