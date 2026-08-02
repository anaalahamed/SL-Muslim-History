export interface AdminPermissions {
  user_id: string
  name: string
  email: string
  can_articles: boolean
  can_news_special: boolean
  can_news_janaza: boolean
  can_categories: boolean
  can_authors: boolean
  can_comments: boolean
  can_reactions: boolean
  can_ads: boolean
  can_newsletter: boolean
  can_messages: boolean
  can_settings: boolean
  can_backup: boolean
  created_at: string
}

export type PermissionKey = Exclude<keyof AdminPermissions, 'user_id' | 'name' | 'email' | 'created_at'>

// Single source of truth for every toggleable section — used by both the
// Team Access page (to render the checkboxes) and the sidebar (to hide
// sections a non-owner lacks permission for).
export const PERMISSION_FIELDS: { key: PermissionKey; label: string; navHref?: string }[] = [
  { key: 'can_articles',     label: 'Articles',      navHref: '/admin/articles' },
  { key: 'can_news_special', label: 'Special News' },
  { key: 'can_news_janaza',  label: 'Janaza News' },
  { key: 'can_categories',   label: 'Categories',    navHref: '/admin/categories' },
  { key: 'can_authors',      label: 'Authors',       navHref: '/admin/authors' },
  { key: 'can_comments',     label: 'Comments',      navHref: '/admin/comments' },
  { key: 'can_reactions',    label: 'Reactions',     navHref: '/admin/reactions' },
  { key: 'can_ads',          label: 'Ads',           navHref: '/admin/ads' },
  { key: 'can_newsletter',   label: 'Newsletter',    navHref: '/admin/newsletter' },
  { key: 'can_messages',     label: 'Messages',      navHref: '/admin/messages' },
  { key: 'can_settings',     label: 'Settings',      navHref: '/admin/settings' },
  { key: 'can_backup',       label: 'Backup',        navHref: '/admin/backup' },
]
