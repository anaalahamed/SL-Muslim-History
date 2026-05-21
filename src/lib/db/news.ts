import { supabase } from '../supabase'
import { mockNews } from '../mockData'
import { NewsPost } from '../types'

export async function getNews(): Promise<NewsPost[]> {
  if (!supabase) return mockNews
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .order('published_at', { ascending: false })
  if (error || !data) return mockNews
  return data as NewsPost[]
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  if (!supabase) return mockNews.find((n) => n.slug === slug) ?? null
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return data as NewsPost
}

export async function getNewsById(id: string): Promise<NewsPost | null> {
  if (!supabase) return mockNews.find((n) => n.id === id) ?? null
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as NewsPost
}

export async function getBreakingNews(): Promise<NewsPost[]> {
  if (!supabase) return mockNews.filter((n) => n.is_breaking)
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('is_breaking', true)
    .order('published_at', { ascending: false })
    .limit(5)
  if (error || !data) return mockNews.filter((n) => n.is_breaking)
  return data as NewsPost[]
}

export async function getLatestNews(limit = 5): Promise<NewsPost[]> {
  if (!supabase) return mockNews.slice(0, limit)
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error || !data) return mockNews.slice(0, limit)
  return data as NewsPost[]
}

export async function saveNews(post: Partial<NewsPost>): Promise<{ data: NewsPost | null; error: string | null }> {
  if (!supabase) return { data: null, error: 'Supabase not configured' }
  if (post.id) {
    const { id, ...rest } = post
    const { data, error } = await supabase
      .from('news_posts')
      .update(rest)
      .eq('id', id)
      .select()
      .single()
    return { data: data as NewsPost | null, error: error?.message ?? null }
  }
  const { data, error } = await supabase
    .from('news_posts')
    .insert(post)
    .select()
    .single()
  return { data: data as NewsPost | null, error: error?.message ?? null }
}

export async function deleteNews(id: string): Promise<string | null> {
  if (!supabase) return 'Supabase not configured'
  const { error } = await supabase.from('news_posts').delete().eq('id', id)
  return error?.message ?? null
}

export async function toggleBreakingNews(id: string, is_breaking: boolean): Promise<string | null> {
  if (!supabase) return 'Supabase not configured'
  const { error } = await supabase.from('news_posts').update({ is_breaking }).eq('id', id)
  return error?.message ?? null
}
