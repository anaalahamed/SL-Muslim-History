// Admin configuration — editable from Settings page
// In production this will be stored in Supabase. For now, localStorage is used.

import { SITE_DESCRIPTION } from './seo'

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

export interface Milestone {
  id: string
  year: string        // e.g. '2026'
  event: string       // English — e.g. 'New website launched'
  eventTamil?: string // Tamil translation, shown below the English line
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
  telegram: string
  reddit: string
  pinterest: string
  // About page content
  mission: string
  teamMembers: TeamMember[]
  stats: Stat[]
  milestones: Milestone[]
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
  telegram: '',
  reddit: '',
  pinterest: '',
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
  milestones: [
    {
      id: '1', year: '2018',
      event: "SL Muslim History founded to document, preserve, and share the history of Sri Lanka's Muslim community, in Tamil.",
      eventTamil: 'இலங்கை முஸ்லிம்களின் வரலாற்றை பதிவு செய்யவும், பாதுகாக்கவும், தமிழில் பகிரவும் "SL Muslim History" 2018-ல் தொடங்கப்பட்டது.',
    },
    {
      id: '2', year: '2018',
      event: 'Reported accurately on the anti-Muslim riots in Kandy District (Digana, Teldeniya) — where mob violence, amid hate speech and widely criticized police inaction, destroyed or damaged hundreds of Muslim homes, shops, and mosques — and faced backlash for refusing to stay silent.',
      eventTamil: 'கண்டி மாவட்டத்தில் (டிகானா, தெல்தெனிய) நடந்த முஸ்லிம் எதிர்ப்பு கலவரங்களை — வெறுப்பு பேச்சுகளுக்கும், காவல்துறையின் தாமத நடவடிக்கை குறித்த கடும் விமர்சனங்களுக்கும் மத்தியில், நூற்றுக்கணக்கான முஸ்லிம் வீடுகள், கடைகள், பள்ளிவாசல்கள் அழிந்த/சேதமடைந்த நிகழ்வை — உண்மைக்கு மாறாமல் வெளியிட்டோம். மௌனமாக இருக்க மறுத்ததற்காக எதிர்ப்புகளை சந்தித்தோம்.',
    },
    {
      id: '3', year: '2020',
      event: "During the COVID-19 pandemic, reported openly on the Sri Lankan government's forced cremation of Muslim COVID-19 victims — going against Islamic burial rites and widely condemned internationally — without hiding or softening the story, at a time few platforms dared to cover it directly.",
      eventTamil: 'கொரோனா காலத்தில், இலங்கை அரசு முஸ்லிம் பாதிக்கப்பட்டவர்களின் உடல்களை — இஸ்லாமிய அடக்க முறைக்கு முரணாக, உலகளவில் கண்டிக்கப்பட்ட வகையில் — கட்டாயமாக எரிக்க வைத்த விவகாரத்தை, யாரும் நேரடியாக சொல்ல தயங்கிய நேரத்தில், மறைக்காமல் வெளிப்படையாக வெளியிட்டோம்.',
    },
    {
      id: '4', year: '2020–2025',
      event: 'Faced repeated challenges and pushback for reporting sensitive community issues honestly. Each year brought new struggles, and each year we found a way to continue.',
      eventTamil: 'சமூகத்தை பாதிக்கும் முக்கியமான விஷயங்களை நேர்மையாக வெளியிட்டதற்காக, தொடர்ந்து பல சவால்களையும் எதிர்ப்புகளையும் சந்தித்தோம். ஒவ்வொரு வருடமும் புதிய சிக்கல்கள் வந்தாலும், ஒவ்வொரு முறையும் தொடர வழி கண்டோம்.',
    },
    {
      id: '5', year: '2026',
      event: 'New website launched with full Tamil content and modern design.',
      eventTamil: 'முழு தமிழ் உள்ளடக்கத்துடனும், புதிய வடிவமைப்புடனும் புதிய இணையதளம் தொடங்கப்பட்டது.',
    },
    {
      id: '6', year: 'Today',
      event: 'Still growing, and still relying on the support and contributions of the community to continue this work.',
      eventTamil: 'இன்றும் தொடர்ந்து வளர்ந்து வருகிறோம், இந்த பணியை தொடர சமூகத்தின் ஆதரவும் பங்களிப்பும் இன்றியமையாதது.',
    },
  ],
  seo: {
    metaDescription: SITE_DESCRIPTION,
    ogImage: '/og-image.jpg',
  },
  announcement: {
    enabled: false,
    text: '',
    link: '',
    color: 'green',
  },
}

// Persist the parts of AdminConfig that visitors actually need to see —
// social links, and the About page's team/stats/mission — to Supabase, so
// they show up for every visitor and device instead of staying stuck in
// just the admin's own browser storage.
export async function saveSharedConfigToSupabase(config: AdminConfig, client?: import('@supabase/supabase-js').SupabaseClient): Promise<void> {
  try {
    // updateSiteSettings merges rather than overwrites — saveSiteSettings
    // replaces the whole stored config, which would otherwise silently wipe
    // out reactionsLastViewed/newsletterLastViewed every time any settings
    // tab is saved.
    const { updateSiteSettings } = await import('./db/siteSettings')
    await updateSiteSettings({
      facebook:  config.facebook  || '',
      youtube:   config.youtube   || '',
      whatsapp:  config.whatsapp  || '',
      twitter:   config.twitter   || '',
      instagram: config.instagram || '',
      telegram:  config.telegram  || '',
      reddit:    config.reddit    || '',
      pinterest: config.pinterest || '',
      teamMembers: config.teamMembers,
      stats:       config.stats,
      milestones:  config.milestones,
      mission:     config.mission,
      metaDescription: config.seo.metaDescription || '',
      ogImage:         config.seo.ogImage || '',
      email:    config.email    || '',
      phone:    config.phone    || '',
      location: config.location || '',
      maintenanceMode: config.maintenanceMode,
      announcement:    config.announcement,
    }, client)
  } catch {
    // non-critical — localStorage still works for local admin
  }
}

// Merges the shared Supabase-backed fields on top of a local AdminConfig —
// used by both the public About page and the admin Settings page so both
// reflect the true, shared state rather than only what's cached locally.
export async function mergeSharedConfigFromSupabase(config: AdminConfig): Promise<AdminConfig> {
  try {
    const { getSiteSettings } = await import('./db/siteSettings')
    const shared = await getSiteSettings()
    if (!shared) return config
    return {
      ...config,
      facebook:  shared.facebook  ?? config.facebook,
      youtube:   shared.youtube   ?? config.youtube,
      whatsapp:  shared.whatsapp  ?? config.whatsapp,
      twitter:   shared.twitter   ?? config.twitter,
      instagram: shared.instagram ?? config.instagram,
      telegram:  shared.telegram  ?? config.telegram,
      reddit:    shared.reddit    ?? config.reddit,
      pinterest: shared.pinterest ?? config.pinterest,
      teamMembers: shared.teamMembers ?? config.teamMembers,
      stats:       shared.stats       ?? config.stats,
      milestones:  shared.milestones  ?? config.milestones,
      mission:     shared.mission     ?? config.mission,
      seo: {
        ...config.seo,
        metaDescription: shared.metaDescription || config.seo.metaDescription,
        ogImage:         shared.ogImage         || config.seo.ogImage,
      },
      email:    shared.email    ?? config.email,
      phone:    shared.phone    ?? config.phone,
      location: shared.location ?? config.location,
      maintenanceMode: shared.maintenanceMode ?? config.maintenanceMode,
      announcement:    shared.announcement    ?? config.announcement,
    }
  } catch {
    return config
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
      milestones:         parsed.milestones         ?? defaultConfig.milestones,
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
