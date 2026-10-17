import Link from 'next/link'
import { LogoLockup } from '@/components/brand/Logo'
import { LogoForest, Spruce } from '@/components/brand/Ornament'
import { getOpeningHours, formatRange, getOpenStatus } from '@/lib/hours'
import { SITE } from '@/lib/site'

export function SiteFooter() {
  const hours = getOpeningHours()
  const status = getOpenStatus()

  return (
    <footer className="mt-auto bg-forest-900 text-kraft-200">
      {/* Кромка леса — ели с логотипа, выгравированные по верхней кромке подвала.
          Цвет гравировки равен фону секции выше: линии не рисуются поверх
          дерева, а вырезают его, как в фирменном знаке. */}
      <LogoForest className="h-10 w-full text-forest-700 sm:h-12" />

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div>
          <LogoLockup />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-kraft-300">{SITE.tagline}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-moss-300">
            {status.isOpen ? 'Сейчас открыто' : 'Сейчас закрыто'}
          </p>
        </div>

        <div>
          <h2 className="font-heading text-lg text-kraft-100">Контакты</h2>
          <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed text-kraft-300">
            <p>{SITE.addressFull}</p>
            <p>
              <a href={SITE.phoneHref} className="tnum transition-colors hover:text-kraft-100">
                {SITE.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-kraft-100">
                {SITE.email}
              </a>
            </p>
          </address>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {SITE.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-xs uppercase tracking-[0.16em] text-moss-300 transition-colors hover:text-kraft-100"
                rel="noopener noreferrer"
                target="_blank"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-lg text-kraft-100">Часы работы</h2>
          <dl className="mt-4 space-y-1.5 text-sm text-kraft-300">
            {hours.map((day) => (
              <div key={day.weekday} className="flex items-baseline justify-between gap-4">
                <dt>{day.label}</dt>
                <dd className="tnum text-kraft-200">{formatRange(day)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="font-heading text-lg text-kraft-100">Гостям</h2>
          <ul className="mt-4 space-y-2 text-sm text-kraft-300">
            <li>
              <Link href="/menu" className="transition-colors hover:text-kraft-100">
                Меню
              </Link>
            </li>
            <li>
              <Link href="/lunch" className="transition-colors hover:text-kraft-100">
                Бизнес-ланч
              </Link>
            </li>
            <li>
              <Link href="/booking" className="transition-colors hover:text-kraft-100">
                Забронировать стол
              </Link>
            </li>
            <li>
              <Link href="/events" className="transition-colors hover:text-kraft-100">
                Афиша мероприятий
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-kraft-100">
                Политика конфиденциальности
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-forest-500/50">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-moss-300 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Spruce className="h-3.5 w-auto text-forest-500" />
            © {new Date().getFullYear()} Ресторан «{SITE.name}». Все права защищены.
          </p>
          <p className="text-moss-300/80">ИНН и юридические данные — уточняются</p>
        </div>
      </div>
    </footer>
  )
}
