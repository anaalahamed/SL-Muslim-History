import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import RichContent from '@/components/ui/RichContent'
import { Article } from '@/lib/types'

const CONTENT_WIDTH_PX = 760
const PIXEL_SCALE = 2
const PAGE_MARGIN_MM = 10
const PAGE_WIDTH_MM = 210 // A4
const PAGE_HEIGHT_MM = 297 // A4

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
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // html2canvas needs the element positioned at valid, non-clipped
  // coordinates to capture it correctly (negative offsets or a zero-size
  // clipping ancestor both make the capture come out blank/garbled). Keep it
  // at (0,0) and hide it purely via stacking order (z-index below the real
  // page content) instead, which doesn't affect how it's painted.
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.zIndex = '-1'
  container.style.width = `${CONTENT_WIDTH_PX}px`
  container.style.background = 'white'
  container.style.padding = '32px'
  document.body.appendChild(container)

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
    // Render the whole article to one tall screenshot. This (not jsPDF's own
    // vector text) is what correctly renders Tamil script — it's real
    // browser-drawn pixels, not glyphs looked up in a font jsPDF doesn't have.
    // windowHeight must be set explicitly to the container's real height —
    // left at its default it's the browser's visible viewport height, which
    // silently truncates the capture for any article taller than one screen.
    const fullHeightPx = Math.ceil(container.getBoundingClientRect().height)
    const canvas = await html2canvas(container, {
      scale: PIXEL_SCALE,
      useCORS: true,
      windowWidth: CONTENT_WIDTH_PX,
      windowHeight: fullHeightPx,
      height: fullHeightPx,
    })

    const contentWidthMm = PAGE_WIDTH_MM - PAGE_MARGIN_MM * 2
    const contentHeightMm = PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2
    const mmPerPx = contentWidthMm / CONTENT_WIDTH_PX
    const pageHeightCanvasPx = Math.floor((contentHeightMm / mmPerPx) * PIXEL_SCALE)

    // Trying to predict, from DOM measurements taken *before* the
    // screenshot, exactly where html2canvas will place each line is
    // fragile — any tiny drift between the measurement and the real
    // render silently drops the content in between. Instead, cut directly
    // against the real rendered pixels: search for a genuinely blank row
    // (real whitespace between lines/paragraphs) near each target page
    // boundary, so a page break can never land inside a line of text.
    const ctx = canvas.getContext('2d')
    let canReadPixels = !!ctx
    function isRowBlank(y: number): boolean {
      if (!ctx) return false
      const row = ctx.getImageData(0, y, canvas.width, 1).data
      for (let i = 0; i < row.length; i += 4) {
        if (row[i] < 250 || row[i + 1] < 250 || row[i + 2] < 250) return false
      }
      return true
    }
    if (ctx) {
      try {
        ctx.getImageData(0, 0, 1, 1)
      } catch {
        // Canvas is tainted (e.g. a cross-origin image without CORS headers
        // slipped through) — fall back to cutting at the raw target row.
        canReadPixels = false
      }
    }
    const SEARCH_RADIUS_PX = Math.round(60 * PIXEL_SCALE)
    function findCutRow(targetY: number): number {
      if (!canReadPixels) return targetY
      for (let offset = 0; offset <= SEARCH_RADIUS_PX; offset++) {
        const below = targetY + offset
        if (below < canvas.height && isRowBlank(below)) return below
        const above = targetY - offset
        if (above > 0 && isRowBlank(above)) return above
      }
      return targetY
    }

    const cuts = [0]
    let y = 0
    while (canvas.height - y > pageHeightCanvasPx) {
      const cut = findCutRow(y + pageHeightCanvasPx)
      cuts.push(cut)
      y = cut
    }
    cuts.push(canvas.height)

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    for (let i = 0; i < cuts.length - 1; i++) {
      const top = cuts[i]
      const bottom = cuts[i + 1]
      const heightCanvasPx = bottom - top
      if (heightCanvasPx <= 0) continue
      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = canvas.width
      cropCanvas.height = heightCanvasPx
      const cctx = cropCanvas.getContext('2d')
      if (!cctx) continue
      cctx.drawImage(canvas, 0, top, canvas.width, heightCanvasPx, 0, 0, canvas.width, heightCanvasPx)
      if (i > 0) pdf.addPage()
      pdf.addImage(
        cropCanvas.toDataURL('image/jpeg', 0.92),
        'JPEG',
        PAGE_MARGIN_MM,
        PAGE_MARGIN_MM,
        contentWidthMm,
        (heightCanvasPx / PIXEL_SCALE) * mmPerPx
      )
    }

    pdf.save(`${sanitizeFilename(article.title)}.pdf`)
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}
