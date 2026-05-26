// Admin configuration — editable from Settings page
// In production this will be stored in Supabase. For now, localStorage is used.

export interface TeamMember {
  id: string
  name: string      // Tamil
  role: string      // English
  bio: string       // English
  initials: string
  color: string
}

export interface Stat {
  id: string
  value: string     // e.g. '175+'
  label: string     // e.g. 'Articles Published'
  icon: string      // emoji
}

export interface Announcement {
  enabled: boolean
  text: string
  link: string
  color: 'green' | 'gold' | 'red' | 'blue'
}

export interface SEO {
  metaDescription: string
  ogImage: string
  googleAnalyticsId: string
}

export interface AdminConfig {
  maintenanceMode: boolean
  ownerName: string
  siteName: string
  tagline: string
  email: string
  phone: string
  location: string
  facebook: string
  youtube: string
  whatsapp: string
  twitter: string
  instagram: string
  // About page content
  mission: string
  teamMembers: TeamMember[]
  stats: Stat[]
  // Homepage control
  heroArticleId: string
  heroBannerImage: string
  featuredArticleIds: string[]
  // SEO
  seo: SEO
  // Announcement banner
  announcement: Announcement
}

export const defaultConfig: AdminConfig = {
  maintenanceMode: false,
  ownerName: 'Admin',
  siteName: 'SL Muslim History',
  tagline: "Preserving the rich history and living heritage of Sri Lanka's Muslim community.",
  email: 'info@srilankamuslimhistory.com',
  phone: '+94 11 234 5678',
  location: 'Colombo, Sri Lanka',
  facebook: '',
  youtube: '',
  whatsapp: '',
  twitter: '',
  instagram: '',
  mission: "Sri Lanka's Muslim community has a history stretching back over 1,400 years — predating the arrival of colonial powers and deeply intertwined with the island's culture, trade, and society. Yet much of this history remains undocumented or scattered across fragmented sources.\n\nOur mission is to change that. We bring together historians, researchers, and community contributors to create a comprehensive, accessible, and beautifully presented record of this heritage — in Tamil, for the community.",
  teamMembers: [
    { id: '1', name: 'டாக்டர் A. முஹம்மட்', role: 'Chief Editor & Historian',  bio: 'PhD in Islamic History from the University of Colombo. Over 20 years of research into Sri Lanka Muslim heritage.', initials: 'AM', color: '#1d4ed8' },
    { id: '2', name: 'Z. அபூபக்கர்',          role: 'Senior Researcher',          bio: 'Specialist in mosque architecture and Islamic sacred sites across Sri Lanka. Author of 3 published books.',          initials: 'ZA', color: '#15803d' },
    { id: '3', name: 'I. ஹமீட்',              role: 'Cultural Historian',          bio: 'Expert in Sufi traditions and Tamil-Muslim cultural heritage. Contributor to national heritage preservation programs.',  initials: 'IH', color: '#7c3aed' },
    { id: '4', name: 'F. அமீனா',              role: 'Content Writer',              bio: 'Specialises in documenting Muslim food heritage, traditions, and community life in Sri Lanka.',                          initials: 'FA', color: '#c2410c' },
  ],
  stats: [
    { id: '1', value: '175+',  label: 'Articles Published',    icon: '📝' },
    { id: '2', value: '50k+',  label: 'Monthly Readers',       icon: '👥' },
    { id: '3', value: '1,400', label: 'Years of History',      icon: '📜' },
    { id: '4', value: '20+',   label: 'Research Contributors', icon: '🎓' },
  ],
  heroArticleId: '',
  heroBannerImage: '',
  featuredArticleIds: [],
  seo: {
    metaDescription: "Preserving the rich history and living heritage of Sri Lanka's Muslim community.",
    ogImage: '',
    googleAnalyticsId: '',
  },
  announcement: {
    enabled: false,
    text: '',
    link: '',
    color: 'green',
  },
}

// Persist social links to Supabase so they appear on all devices/browsers.
// Requires a `site_settings` table (run the migration SQL in Supabase):
//   CREATE TABLE IF NOT EXISTS site_settings (
//     id integer PRIMARY KEY DEFAULT 1,
//     config jsonb NOT NULL DEFAULT '{}'
//   );
//   INSERT INTO site_settings (id, config) VALUES (1, '{}') ON CONFLICT (id) DO NOTHING;
export async function saveSocialLinksToSupabase(config: AdminConfig): Promise<void> {
  try {
    const { supabase } = await import('./supabase')
    if (!supabase) return
    const payload = {
      facebook:  config.facebook  || '',
      youtube:   config.youtube   || '',
      whatsapp:  config.whatsapp  || '',
      twitter:   config.twitter   || '',
      instagram: config.instagram || '',
    }
    await supabase.from('site_settings').upsert({ id: 1, config: payload })
  } catch {
    // non-critical — localStorage still works for local admin
  }
}

export function getAdminConfig(): AdminConfig {
  if (typeof window === 'undefined') return defaultConfig
  try {
    const stored = localStorage.getItem('slmh_admin_config')
    if (!stored) return defaultConfig
    const parsed = JSON.parse(stored)
    return {
      ...defaultConfig,
      ...parsed,
      // Ensure arrays / objects always have defaults if missing
      teamMembers:        parsed.teamMembers        ?? defaultConfig.teamMembers,
      stats:              parsed.stats              ?? defaultConfig.stats,
      featuredArticleIds: parsed.featuredArticleIds ?? defaultConfig.featuredArticleIds,
      seo:         { ...defaultConfig.seo,          ...(parsed.seo         ?? {}) },
      announcement:{ ...defaultConfig.announcement, ...(parsed.announcement ?? {}) },
    }
  } catch {
    return defaultConfig
  }
}

export function saveAdminConfig(config: AdminConfig): void {
  localStorage.setItem('slmh_admin_config', JSON.stringify(config))
}
