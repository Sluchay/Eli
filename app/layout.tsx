import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SiteFooter } from '@/components/public/SiteFooter'
import { SiteHeader } from '@/components/public/SiteHeader'
import { bodyFont, headingFont } from '@/lib/fonts'
import { SITE } from '@/lib/site'

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — ресторан русской кухни в хвойном лесу`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.descriptionShort,
  applicationName: SITE.name,
  keywords: ['ресторан', 'русская кухня', 'хвойный лес', 'живая музыка', SITE.city],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: `Ресторан ${SITE.name}`,
    title: `${SITE.name} — ресторан русской кухни в хвойном лесу`,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-brand focus:bg-forest-700 focus:px-4 focus:py-2 focus:text-kraft-100"
        >
          Перейти к содержимому
        </a>
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
