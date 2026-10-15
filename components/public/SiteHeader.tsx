import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'
import { getOpenStatus } from '@/lib/hours'
import { SITE } from '@/lib/site'

const NAV = [
  { href: '/menu', label: 'Меню' },
  { href: '/events', label: 'Афиша' },
  { href: '/#contacts', label: 'Контакты' },
]

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.2 2.5H3.6c-.6 0-1.1.5-1.1 1.1 0 7.6 6.2 13.8 13.8 13.8.6 0 1.1-.5 1.1-1.1v-2.6l-3.5-1.3-1.5 1.9a11.6 11.6 0 0 1-4.8-4.8l1.9-1.5L6.2 2.5Z" />
    </svg>
  )
}

export function SiteHeader() {
  const status = getOpenStatus()

  return (
    <header className="sticky top-0 z-40 border-b border-kraft-300/80 bg-kraft-100/95 backdrop-blur-sm">
      <div className="container-page flex items-center justify-between gap-4 py-2.5">
        <Link href="/" aria-label={`${SITE.name} — на главную`} className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-forest-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`hidden items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] lg:inline-flex ${
              status.isOpen ? 'text-ok' : 'text-berry'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? 'bg-ok' : 'bg-berry'}`}
              aria-hidden="true"
            />
            {status.short}
          </span>

          <a
            href={SITE.phoneHref}
            className="inline-flex min-h-11 items-center gap-2 px-1 font-body text-[0.8125rem] font-medium text-ink transition-colors hover:text-forest-700 sm:px-2"
          >
            <PhoneIcon className="h-4 w-4 text-brass sm:hidden" />
            <span className="hidden tnum sm:inline">{SITE.phoneDisplay}</span>
            <span className="sr-only sm:hidden">Позвонить: {SITE.phoneDisplay}</span>
          </a>

          <Link href="/menu" className={buttonClass('primary', 'md')}>
            Меню
          </Link>
        </div>
      </div>
    </header>
  )
}
