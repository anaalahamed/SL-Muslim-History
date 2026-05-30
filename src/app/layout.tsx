import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import FontLoader from '@/components/layout/FontLoader'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import AnalyticsPageView from '@/components/analytics/AnalyticsPageView'
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, websiteJsonLd, organizationJsonLd } from '@/lib/seo'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a3d1a',
}

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
        {/* Preconnect so DNS/TCP is ready when FontLoader requests the stylesheet */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inline critical font fallbacks — no blocking network request */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
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
        <FontLoader />
        <Suspense>
          <AnalyticsPageView />
        </Suspense>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  )
}
