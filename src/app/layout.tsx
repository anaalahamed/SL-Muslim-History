import type { Metadata, Viewport } from 'next'
import './globals.css'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import AnalyticsPageView from '@/components/analytics/AnalyticsPageView'
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, websiteJsonLd, organizationJsonLd } from '@/lib/seo'

// Server-rendered so the browser discovers and starts fetching this while
// parsing the initial HTML, instead of waiting for JS to hydrate and inject
// it (which is what the old client-side FontLoader component did). The
// `&display=swap` in the URL means text still paints immediately with the
// criticalCSS fallback fonts below and swaps in once this loads — this
// change makes it load *sooner*, it doesn't make anything render-blocking.
//
// Noto Sans Tamil is a separate request on display=optional rather than
// swap: PageSpeed's CLS trace (mobile and desktop) explicitly attributed
// large layout shifts to "Web font" on Tamil text throughout the page —
// this site has dozens of Tamil text blocks, and swapping the fallback
// font for the real one changes enough glyph metrics to reflow all of
// them at once, and whichever element that reflow happens to push around
// varies between page loads. display=optional tells the browser to skip
// the swap entirely if the font isn't ready almost immediately, using the
// fallback for that visit instead — once cached (after the first
// request), it's used instantly on every later visit with no swap at
// all. Latin fonts don't have this problem, so they keep display=swap.
const LATIN_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700' +
  '&family=Lato:wght@400;700;900' +
  '&display=swap'
const TAMIL_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700;800' +
  '&display=optional'

// Every page loads data from Supabase; preconnecting to its origin lets the
// browser start the DNS/TLS handshake immediately instead of paying that
// cost on the first actual data request.
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : null
  } catch {
    return null
  }
})()

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a3d1a',
}

// Kept static (not reading Settings/Supabase here) so every page in the
// site keeps its fast, pre-built rendering — only the homepage's own
// metadata (page.tsx) is admin-editable, since that's the one page that
// actually needed it and was already dynamic to begin with.
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: BASE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'ta_LK',
    alternateLocale: 'en_US',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Sri Lanka Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  alternates: { canonical: BASE_URL },
  verification: { google: 'MAeIaxJFGMQyiWZsaSBa9wjuTm3VvLJCc_aY8o5a24c' },
  // Proves site ownership to Google AdSense — separate from the Search
  // Console verification tag above (different meta name, same idea).
  other: { 'google-adsense-account': 'ca-pub-9374080740169651' },
}

// Critical inline CSS — visible immediately, before fonts download.
// Fallback families chosen to match the metric of the real fonts (reduces CLS).
const criticalCSS = `
  body { font-family: system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif; }
  .serif-heading { font-family: Georgia,'Times New Roman',serif; }
  .tamil-text,.tamil-heading { font-family: 'Noto Sans Tamil',system-ui,sans-serif; }
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta" data-scroll-behavior="smooth">
      <head>
        {/* Preconnect so DNS/TCP is ready before the font stylesheet/Supabase requests fire */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} />}
        {/* Inline critical font fallbacks — no blocking network request */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        {/* Load the font stylesheet without blocking rendering: media="print"
            makes the browser fetch it at high priority without waiting for
            it before painting, then the inline script flips it to "all" once
            it's loaded. This is the standard non-render-blocking pattern for
            an externally hosted stylesheet (can't use next/font here since
            these are loaded via the Google Fonts CSS API, not self-hosted).
            <noscript> covers the no-JS case. */}
        <link rel="preload" as="style" href={LATIN_FONT_URL} />
        <link rel="stylesheet" href={LATIN_FONT_URL} media="print" id="latin-fonts-css" suppressHydrationWarning />
        <link rel="preload" as="style" href={TAMIL_FONT_URL} />
        <link rel="stylesheet" href={TAMIL_FONT_URL} media="print" id="tamil-font-css" suppressHydrationWarning />
        <script
          dangerouslySetInnerHTML={{ __html: `document.getElementById('latin-fonts-css').media='all';document.getElementById('tamil-font-css').media='all'` }}
        />
        <noscript>
          <link rel="stylesheet" href={LATIN_FONT_URL} />
          <link rel="stylesheet" href={TAMIL_FONT_URL} />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AnalyticsPageView />
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  )
}
