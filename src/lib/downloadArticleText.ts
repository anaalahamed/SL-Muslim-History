import { Article } from '@/lib/types'

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 150) || 'article'
}

// Strips markdown syntax down to clean, readable prose — headings/bold/italic
// markers removed, links reduced to just their text, images replaced with a
// placeholder note (the text file is for words, not photos).
function markdownToPlainText(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m, alt: string) => (alt ? `[Photo: ${alt}]` : '[Photo]'))
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^---+$/gm, '----------')
    .trim()
}

export function downloadArticleAsText(article: Article): void {
  const dateLine = article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString()}` : ''
  const text = [
    article.title,
    `${article.author}${dateLine}`,
    '',
    markdownToPlainText(article.content),
  ].join('\n')

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(article.title)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
