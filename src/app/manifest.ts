import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SL Muslim History | இலங்கை முஸ்லிம்களின் வரலாறு',
    short_name: 'SL Muslim History',
    description: "Preserving the rich history and living heritage of Sri Lanka's Muslim community.",
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5f0',
    theme_color: '#1a3d1a',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
