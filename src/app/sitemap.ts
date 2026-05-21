import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://srilankamuslimhistory.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://srilankamuslimhistory.com/articles', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://srilankamuslimhistory.com/news', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://srilankamuslimhistory.com/category', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://srilankamuslimhistory.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://srilankamuslimhistory.com/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://srilankamuslimhistory.com/donate', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
