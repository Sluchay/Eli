import type { MetadataRoute } from 'next'

/** Админка, API и загрузки не должны попадать в поиск. */

const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
