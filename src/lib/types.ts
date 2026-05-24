export interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category: string          // primary category name
  category_slug: string     // primary category slug
  categories: string[]      // multiple category slugs
  author: string            // display name
  author_id: string | null  // linked author id
  author_link: string       // profile/contact URL
  featured_image: string
  gallery: GalleryImage[]   // multiple photos
  views: number
  is_featured: boolean
  published_at: string
}

export interface GalleryImage {
  id: string
  url: string
  caption: string
  order: number
  is_featured: boolean
}

export interface Author {
  id: string
  name: string
  name_ta: string
  bio: string
  profile_link: string
  avatar_url: string
  created_at: string
}

export interface NewsPost {
  id: string
  title: string
  slug: string
  content: string
  featured_image: string
  news_type: 'special' | 'janaza'
  published_at: string
}

export interface Category {
  id: string
  name_en: string
  name_ta: string
  slug: string
  icon: string
  parent_id: string | null   // null = top-level, id = subcategory
  article_count: number
}

export interface Advertisement {
  id: string
  title: string
  image_url: string
  link_url: string
  position: 'sidebar' | 'banner' | 'between-news'
  is_active: boolean
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  reason: string
  message: string
  received_at: string
  read: boolean
}
