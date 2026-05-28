import type { Metadata } from 'next'
import { BASE_URL, SITE_NAME, SITE_KEYWORDS } from '@/lib/seo'
import CategoryIndexClient from './CategoryIndexClient'

export const metadata: Metadata = {
  title: 'Categories | Browse Sri Lanka Muslim History Topics',
  description: 'Browse all categories of Sri Lankan Muslim history — Early History, Mosques & Places, Culture & Traditions, Notable Figures, Literature & Arts, Community & Society.',
  keywords: ['Sri Lanka Muslim History categories', 'இலங்கை முஸ்லிம் வகைகள்', ...SITE_KEYWORDS.slice(0, 10)],
  alternates: { canonical: `${BASE_URL}/category` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/category`,
    siteName: SITE_NAME,
    title: `Browse Categories | ${SITE_NAME}`,
    description: 'Explore all categories of Sri Lankan Muslim history — covering 1,400 years of heritage, culture, and community.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Browse Categories | ${SITE_NAME}`,
    description: 'Explore all categories of Sri Lankan Muslim history.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function CategoryPage() {
  return <CategoryIndexClient />
}
