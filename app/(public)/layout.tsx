import { SiteFooter } from '@/components/public/SiteFooter'
import { SiteHeader } from '@/components/public/SiteHeader'

/**
 * Каркас публичной части: шапка и подвал есть у всех страниц сайта,
 * но не у админки — у неё своя шапка (см. app/admin/(panel)/layout.tsx).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
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
