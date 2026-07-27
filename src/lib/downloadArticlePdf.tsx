import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
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

  // html2canvas rasterizes onto a canvas sized to the viewport, then crops
  // out the target element using its absolute coordinates. An element
  // parked at `left: -9999px` sits entirely outside that canvas, so the
  // cropped-out result is blank. Keep the content at (0,0) instead and hide
  // it with a zero-size, overflow-hidden wrapper so it never paints on screen.
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.top = '0'
  wrapper.style.left = '0'
  wrapper.style.width = '0'
  wrapper.style.height = '0'
  wrapper.style.overflow = 'hidden'
  document.body.appendChild(wrapper)

  const container = document.createElement('div')
  container.style.width = '760px'
  container.style.background = 'white'
  container.style.padding = '32px'
  wrapper.appendChild(container)

  const root = createRoot(container)
  // flushSync forces React to commit synchronously so the DOM is fully
  // populated before html2canvas reads it (root.render alone is async).
  flushSync(() => {
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
  })

  if (document.fonts?.ready) await document.fonts.ready
  await waitForImages(container)

  try {
    await html2pdf()
      .set({
        margin: 10,
        filename: `${sanitizeFilename(article.title)}.pdf`,
        html2canvas: { scale: 2, useCORS: true, windowWidth: 760 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(container)
      .save()
  } finally {
    root.unmount()
    document.body.removeChild(wrapper)
  }
}
