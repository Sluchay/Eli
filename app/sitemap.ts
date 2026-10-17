import type { MetadataRoute } from 'next'

/** Карта сайта: только публичные страницы, без админки и служебных маршрутов. */

const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/menu`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/lunch`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/events`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/booking`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
