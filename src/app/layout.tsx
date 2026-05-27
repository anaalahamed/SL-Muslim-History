import type { Metadata, Viewport } from 'next'
import './globals.css'
import FontLoader from '@/components/layout/FontLoader'

const SITE_URL = 'https://srilankamuslimhistory.com'
const SITE_NAME = 'SL Muslim History'
const SITE_DESC = "Preserving the rich history and living heritage of Sri Lanka's Muslim community."

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a3d1a',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | இலங்கை முஸ்லிம்களின் வரலாறு`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: ['Sri Lanka Muslim history', 'இலங்கை முஸ்லிம்', 'Muslim heritage Sri Lanka', 'Tamil Muslim history', 'Islamic history Sri Lanka'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
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
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | இலங்கை முஸ்லிம்களின் வரலாறு`,
    description: SITE_DESC,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | இலங்கை முஸ்லிம்களின் வரலாறு`,
    description: SITE_DESC,
    images: ['/og-image.jpg'],
  },
  alternates: { canonical: SITE_URL },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESC,
  inLanguage: ['ta', 'en'],
  foundingDate: '2020',
  sameAs: [],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {/* Loads full Google Fonts stylesheet after hydration — non-render-blocking */}
        <FontLoader />
        {children}
      </body>
    </html>
  )
}
