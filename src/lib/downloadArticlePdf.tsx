import { createRoot } from 'react-dom/client'
import RichContent from '@/components/ui/RichContent'
import { Article } from '@/lib/types'

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 150) || 'article'
}

// Waits for every <img> in the container to either finish loading or fail.
// A failed image is removed instead of left in place, since html2canvas
// would otherwise throw on an unloaded/CORS-blocked image.
async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'))
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => { img.remove(); resolve() }
      })
    })
  )
}

export async function downloadArticleAsPdf(article: Article): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '760px'
  container.style.background = 'white'
  container.style.padding = '32px'
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    <div style={{ fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a3d1a', marginBottom: 8, lineHeight: 1.4 }}>
        {article.title}
      </h1>
      <p style={{ fontSize: 13, color: '#6b6b6b', marginBottom: 20 }}>
        {article.author}
        {article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString()}` : ''}
      </p>
      {article.featured_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.featured_image}
          alt=""
          crossOrigin="anonymous"
          style={{ width: '100%', borderRadius: 8, marginBottom: 20, display: 'block' }}
        />
      )}
      <RichContent content={article.content} />
    </div>
  )

  // Let React commit the render before html2canvas reads the DOM.
  await new Promise((resolve) => setTimeout(resolve, 50))
  await waitForImages(container)

  try {
    await html2pdf()
      .set({
        margin: 10,
        filename: `${sanitizeFilename(article.title)}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container)
      .save()
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}
