import { cache } from 'react'
import { supabase } from '../supabase'
import { Article } from '../types'
import { NewsPost } from '../types'
import { Advertisement } from '../types'
import { Category } from '../types'
import { SiteSettingsConfig } from './siteSettings'
import { getRecentArticles, getFeaturedArticles, getArticlesPaginated, getMostReadArticles } from './articles'
import { getSpecialNews, getJanazaNews } from './news'
import { getSidebarAd, getAds } from './ads'
import { getCategories } from './categories'
import { getSiteSettings } from './siteSettings'

export interface HomepageData {
  heroArticles: Article[]
  featuredArticles: Article[]
  articlesPage: { articles: Article[]; total: number }
  specialNews: NewsPost[]
  janazaNews: NewsPost[]
  mostReadArticles: Article[]
  sidebarAd: Advertisement | null
  bottomAds: Advertisement[]
  categories: Category[]
  siteSettings: SiteSettingsConfig | null
}

const ARTICLES_PER_PAGE = 10

// Fetches everything the homepage needs in ONE round-trip via the
// get_homepage_data() Postgres function (supabase/migrations/015_homepage_rpc.sql)
// instead of ~10 separate queries. Falls back to the old multi-query path
// automatically if the RPC errors — most likely because the migration
// hasn't been run yet — so this is safe to deploy before or after that
// migration is applied; it starts using the fast path the moment the
// function exists, with no further deploy needed.
//
// Wrapped in React's cache() so calling it from both generateMetadata()
// and the page component (which both need it — metadata only for
// metaDescription/ogImage) reuses the same in-flight request instead of
// hitting Supabase twice for the same render.
export const getHomepageData = cache(async (): Promise<HomepageData> => {
  if (!supabase) return getHomepageDataFallback()

  const { data, error } = await supabase.rpc('get_homepage_data')
  if (error || !data) {
    console.error('[homepage] get_homepage_data RPC unavailable, using fallback queries:', error?.message)
    return getHomepageDataFallback()
  }

  return {
    heroArticles: data.heroArticles ?? [],
    featuredArticles: data.featuredArticles ?? [],
    articlesPage: data.articlesPage ?? { articles: [], total: 0 },
    specialNews: data.specialNews ?? [],
    janazaNews: data.janazaNews ?? [],
    mostReadArticles: data.mostReadArticles ?? [],
    sidebarAd: data.sidebarAd ?? null,
    bottomAds: data.bottomAds ?? [],
    categories: data.categories ?? [],
    siteSettings: data.siteSettings ?? null,
  }
})

async function getHomepageDataFallback(): Promise<HomepageData> {
  const [
    heroArticles, featuredArticles, articlesPage, specialNews,
    janazaNews, mostReadArticles, sidebarAd, bottomAds, categories, siteSettings,
  ] = await Promise.all([
    getRecentArticles(5),
    getFeaturedArticles(),
    getArticlesPaginated(1, ARTICLES_PER_PAGE),
    getSpecialNews(6),
    getJanazaNews(5),
    getMostReadArticles(5),
    getSidebarAd(),
    getAds('homepage-bottom'),
    getCategories(),
    getSiteSettings(),
  ])

  return {
    heroArticles, featuredArticles, articlesPage, specialNews,
    janazaNews, mostReadArticles, sidebarAd, bottomAds, categories, siteSettings,
  }
}
