import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SL Muslim History | இலங்கை முஸ்லிம் வரலாறு',
    template: '%s | SL Muslim History',
  },
  description:
    "Preserving the rich history and living heritage of Sri Lanka's Muslim community.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Lato:wght@400;700;900&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
