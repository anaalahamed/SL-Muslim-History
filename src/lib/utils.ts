// Returns a plain-text preview for an article card.
// Prefers article.excerpt; falls back to the first paragraph of content,
// since ArticleForm never actually collects an excerpt from admins.
// Strips basic markdown so raw symbols don't appear in the preview.
export function getExcerpt(article: { excerpt?: string; content?: string }, maxWords = 30): string {
  const src = article.excerpt?.trim()
    || article.content?.split('\n\n')[0]?.trim()
    || ''
  const clean = src
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  const words = clean.split(' ')
  return words.length <= maxWords ? clean : words.slice(0, maxWords).join(' ') + '…'
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const mins = Math.ceil(words / 200)
  return `${mins} min read`
}

export function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return String(views)
}
