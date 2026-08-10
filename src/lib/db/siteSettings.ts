import { supabase } from '../supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TeamMember, Stat, Milestone, Announcement } from '../adminConfig'

export interface SiteSettingsConfig {
  facebook?:  string
  youtube?:   string
  whatsapp?:  string
  twitter?:   string
  instagram?: string
  telegram?:  string
  reddit?:    string
  pinterest?: string
  // About page content — shared across every visitor/device, unlike the
  // rest of AdminConfig which still only lives in the admin's own browser.
  teamMembers?: TeamMember[]
  stats?:       Stat[]
  milestones?:  Milestone[]
  mission?:     string
  // SEO — falls back to the hardcoded defaults in lib/seo.ts when unset
  metaDescription?: string
  ogImage?:         string
  // General site info + announcement banner — also shared across devices
  email?:    string
  phone?:    string
  location?: string
  maintenanceMode?: boolean
  announcement?:    Announcement
  // "Last viewed" markers for admin sidebar notification badges — shared
  // across devices so viewing on one laptop clears it everywhere, not just
  // on the browser that happened to view it.
  reactionsLastViewed?:  string
  newsletterLastViewed?: string
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

// Updates just the given fields without clobbering the rest of the shared
// config — saveSiteSettings() replaces the whole JSON blob, so callers that
// only care about one or two fields (like a "last viewed" marker) must
// read-merge-write instead of overwriting everything else that's been saved.
export async function updateSiteSettings(partial: SiteSettingsConfig, client?: SupabaseClient): Promise<void> {
  const current = (await getSiteSettings()) ?? {}
  await saveSiteSettings({ ...current, ...partial }, client)
}
