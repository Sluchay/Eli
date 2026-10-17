import type { Metadata, Viewport } from 'next'
import './globals.css'
import { bodyFont, headingFont } from '@/lib/fonts'
import { SITE } from '@/lib/site'

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    // Город в заголовке — то, по чему локальный ресторан ищут в первую очередь
    default: `${SITE.name} — ресторан русской кухни · ${SITE.city}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.descriptionShort,
  applicationName: SITE.name,
  keywords: ['ресторан', 'русская кухня', 'хвойный лес', 'живая музыка', SITE.city].filter(
    (keyword) => keyword.length > 0,
  ),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: `Ресторан ${SITE.name}`,
    title: `${SITE.name} — ресторан русской кухни · ${SITE.city}`,
    description: SITE.descriptionShort,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true, address: true },
}

export const viewport: Viewport = {
  themeColor: '#1f3a2c',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Корневой каркас: только документ и шрифты.
 *
 * Шапка и подвал публичной части живут в app/(public)/layout.tsx, а у админки
 * своя шапка. Так публичный сайт и кабинет не тянут чужую вёрстку друг другу.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  )
}
