import { supabase } from '../supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SiteSettingsConfig {
  facebook?:  string
  youtube?:   string
  whatsapp?:  string
  twitter?:   string
  instagram?: string
  telegram?:  string
  reddit?:    string
  pinterest?: string
  [key: string]: string | undefined
}

/**
 * Reads the social-links config from site_settings id=1.
 * Returns null when Supabase is not configured or the read fails.
 * All callers must fall back to localStorage via getAdminConfig().
 */
export async function getSiteSettings(): Promise<SiteSettingsConfig | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('config')
      .eq('id', 1)
      .maybeSingle()
    if (error) {
      console.error('[siteSettings] read error:', error.message)
      return null
    }
    if (data?.config && typeof data.config === 'object') {
      return data.config as SiteSettingsConfig
    }
    return null
  } catch (err) {
    console.error('[siteSettings] unexpected error:', err)
    return null
  }
}

export async function saveSiteSettings(config: SiteSettingsConfig, client?: SupabaseClient): Promise<void> {
  const db = client ?? supabase
  if (!db) return
  try {
    const { error } = await db.from('site_settings').upsert({ id: 1, config })
    if (error) console.error('[siteSettings] write error:', error.message)
  } catch (err) {
    console.error('[siteSettings] unexpected write error:', err)
  }
}
