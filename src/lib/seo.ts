import type { Metadata } from 'next'
import { Article, NewsPost } from '@/lib/types'

export const BASE_URL  = 'https://srilankamuslimhistory.com'
export const SITE_NAME = 'Sri Lanka Muslim History'

export const SITE_DESCRIPTION =
  'Preserving and sharing the history, heritage, culture, contributions, traditions, and legacy of Sri Lankan Muslims in Tamil, Sinhala, and English for future generations around the world.'

export const SITE_KEYWORDS = [
  'Sri Lanka Muslim History',
  'இலங்கை முஸ்லிம்களின் வரலாறு',
  'Sri Lankan Muslim Heritage',
  'Ceylon Muslim History',
  'Sonakar History',
  'Malay Muslim Sri Lanka',
  'Sri Lankan Moor History',
  'Islamic History Sri Lanka',
  'Colombo Muslims',
  'Kandyan Muslims',
  'Beruwala Muslims',
  'Hambantota Muslims',
  'Weligama Muslims',
  'Galle Muslims',
  'Muslim Culture Sri Lanka',
  'Muslim Traditions Sri Lanka',
  'Janaza News Sri Lanka',
  'இலங்கை முஸ்லிம்',
  'முஸ்லிம் வரலாறு',
  'இலங்கை இஸ்லாம்',
  'இலங்கை மீரான்',
  'தமிழ் முஸ்லிம்',
  'ஜனாஸா செய்திகள்',
  'முஸ்லிம் பண்பாடு',
  'சோனகர் வரலாறு',
  'Sri Lanka Muslim Scholars',
  'Muslim Mosque Sri Lanka',
  'Sri Lanka Islamic Heritage',
  'Muslim Contributions Sri Lanka',
  'Sri Lankan Muslim Community',
  'சிலோன் முஸ்லிம் வரலாறு',
  'இலங்கை இஸ்லாமிய பாரம்பரியம்',
  'Lankan Muslim Notable Figures',
  'Muslim Literature Sri Lanka',
  'Ceylon Moors History',
]

// ── Metadata generators ──────────────────────────────────────────────────────

export function articleMetadata(article: Article): Metadata {
  const description = article.excerpt?.slice(0, 160) ?? article.content?.slice(0, 160) ?? ''
  const url = `${BASE_URL}/articles/${article.slug}`
  const images = article.featured_image
    ? [{ url: article.featured_image, width: 1200, height: 630, alt: article.title }]
    : [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }]

  return {
    title: article.title,
    description,
    keywords: [article.category, article.author, ...SITE_KEYWORDS.slice(0, 10)],
    authors: [{ name: article.author }],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      title: article.title,
      description,
      publishedTime: article.published_at,
      authors: [article.author],
      section: article.category,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.featured_image ? [article.featured_image] : [`${BASE_URL}/og-image.jpg`],
    },
  }
}

export function newsMetadata(post: NewsPost): Metadata {
  const rawDesc = post.content?.split('\n\n')[0]?.slice(0, 160) ?? post.title
  const url = `${BASE_URL}/news/${post.slug}`
  const isJanaza = post.news_type === 'janaza'
  const typeLabel = isJanaza ? 'Janaza News' : 'Special News'
  const title = `${post.title} | ${typeLabel}`
  const images = post.featured_image
    ? [{ url: post.featured_image, width: 1200, height: 630, alt: post.title }]
    : [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }]

  return {
    title,
    description: rawDesc,
    keywords: [typeLabel, 'Sri Lanka Muslim News', ...SITE_KEYWORDS.slice(0, 8)],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      title,
      description: rawDesc,
      publishedTime: post.published_at,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: rawDesc,
      images: post.featured_image ? [post.featured_image] : [`${BASE_URL}/og-image.jpg`],
    },
  }
}

export function categoryMetadata(nameEn: string, nameTa: string, slug: string): Metadata {
  const url = `${BASE_URL}/category/${slug}`
  const title = `${nameEn} | ${nameTa}`
  const description = `Explore articles about ${nameEn} in Sri Lankan Muslim history — ${nameTa}. Discover heritage, culture, and contributions of Sri Lankan Muslims.`

  return {
    title,
    description,
    keywords: [nameEn, nameTa, ...SITE_KEYWORDS.slice(0, 12)],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [`${BASE_URL}/og-image.jpg`],
    },
  }
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────

export function articleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? article.content?.slice(0, 200),
    image: article.featured_image || `${BASE_URL}/og-image.jpg`,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: { '@type': 'Person', name: article.author, url: `${BASE_URL}/articles?author=${encodeURIComponent(article.author)}` },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    },
    url: `${BASE_URL}/articles/${article.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/articles/${article.slug}` },
    articleSection: article.category,
    inLanguage: 'ta',
  }
}

export function newsJsonLd(post: NewsPost) {
  const isJanaza = post.news_type === 'janaza'
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.content?.split('\n\n')[0]?.slice(0, 200) ?? post.title,
    image: post.featured_image || `${BASE_URL}/og-image.jpg`,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    },
    url: `${BASE_URL}/news/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/news/${post.slug}` },
    articleSection: isJanaza ? 'Janaza News' : 'Special News',
    inLanguage: 'ta',
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ['ta', 'en', 'si'],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ['ta', 'en', 'si'],
    foundingDate: '2020',
    logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    sameAs: [],
  }
}
