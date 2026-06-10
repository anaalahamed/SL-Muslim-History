import { supabase } from '../supabase'
import { Advertisement } from '../types'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function getAds(position?: Advertisement['position']): Promise<Advertisement[]> {
  if (!supabase) return []
  let query = supabase.from('advertisements').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (position) query = query.eq('position', position)
  const { data, error } = await query
  if (error || !data) return []
  return data as Advertisement[]
}

export async function getSidebarAd(): Promise<Advertisement | null> {
  const ads = await getAds('between-news')
  return ads[0] ?? null
}

export async function getAllAds(): Promise<Advertisement[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('advertisements').select('*').order('created_at', { ascending: false })
  if (error || !data) return []
  return data as Advertisement[]
}

export async function saveAd(ad: Partial<Advertisement>, client?: SupabaseClient): Promise<{ data: Advertisement | null; error: string | null }> {
  const db = client ?? supabase
  if (!db) return { data: null, error: 'Supabase not configured' }
  if (ad.id) {
    const { id, ...rest } = ad
    const { data, error } = await db.from('advertisements').update(rest).eq('id', id).select().single()
    return { data: data as Advertisement | null, error: error?.message ?? null }
  }
  const { data, error } = await db.from('advertisements').insert(ad).select().single()
  return { data: data as Advertisement | null, error: error?.message ?? null }
}

export async function deleteAd(id: string, client?: SupabaseClient): Promise<string | null> {
  const db = client ?? supabase
  if (!db) return 'Supabase not configured'
  const { error } = await db.from('advertisements').delete().eq('id', id)
  return error?.message ?? null
}

export async function toggleAdActive(id: string, is_active: boolean, client?: SupabaseClient): Promise<string | null> {
  const db = client ?? supabase
  if (!db) return 'Supabase not configured'
  const { error } = await db.from('advertisements').update({ is_active }).eq('id', id)
  return error?.message ?? null
}
