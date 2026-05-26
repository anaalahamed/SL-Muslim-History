import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://srilankamuslimhistory.com'

// Revalidate once per hour so new articles appear in sitemap quickly
export const revalidate = 3600

const staticPages: MetadataRoute.Sitemap = [
  { url: BASE,                         lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
  { url: `${BASE}/articles`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE}/news`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE}/category`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE}/about`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/contact`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE}/donate`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return staticPages

  try {
    const db = createClient(supabaseUrl, supabaseKey)

    const [{ data: articles }, { data: news }] = await Promise.all([
      db.from('articles')
        .select('slug, published_at')
        .order('published_at', { ascending: false })
        .limit(1000),
      db.from('news_posts')
        .select('slug, published_at')
        .order('published_at', { ascending: false })
        .limit(500),
    ])

    const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: new Date(a.published_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

    const newsPages: MetadataRoute.Sitemap = (news ?? []).map((n) => ({
      url: `${BASE}/news/${n.slug}`,
      lastModified: new Date(n.published_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...articlePages, ...newsPages]
  } catch {
    return staticPages
  }
}
