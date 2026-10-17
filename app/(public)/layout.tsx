import { ScrollToTop } from '@/components/public/ScrollToTop'
import { SiteFooter } from '@/components/public/SiteFooter'
import { SiteHeader } from '@/components/public/SiteHeader'
import { getOpeningHours } from '@/lib/hours'
import { SITE } from '@/lib/site'

const DAYS = [
  'https://schema.org/Monday',
  'https://schema.org/Tuesday',
  'https://schema.org/Wednesday',
  'https://schema.org/Thursday',
  'https://schema.org/Friday',
  'https://schema.org/Saturday',
  'https://schema.org/Sunday',
] as const

/**
 * Микроразметка Restaurant для поисковиков.
 *
 * Это не «SEO-магия», а способ показать в выдаче телефон, адрес и часы —
 * то, что гость локального ресторана ищет в первую очередь. Данные берём из
 * тех же констант, что и страница: разойтись они не могут.
 */
function restaurantJsonLd() {
  const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: SITE.name,
    description: SITE.descriptionShort,
    url: `${base}/`,
    telephone: SITE.phoneDisplay,
    email: SITE.email,
    servesCuisine: 'русская кухня',
    priceRange: '₽₽',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.addressShort,
      addressLocality: SITE.city,
      addressCountry: 'RU',
    },
    hasMenu: `${base}/menu`,
    acceptsReservations: `${base}/booking`,
    openingHoursSpecification: getOpeningHours()
      .filter((day) => day.opensAt && day.closesAt)
      .map((day) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS[day.weekday] ?? DAYS[0],
        opens: day.opensAt,
        closes: day.closesAt,
      })),
  }
}

/**
 * Каркас публичной части: шапка и подвал есть у всех страниц сайта,
 * но не у админки — у неё своя шапка (см. app/admin/(panel)/layout.tsx).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = JSON.stringify(restaurantJsonLd()).replace(/</g, '\\u003c')

  return (
    <div className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ScrollToTop />
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
    </div>
  )
}
