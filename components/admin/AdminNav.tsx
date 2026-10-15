'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/admin/menu', label: 'Меню' },
  { href: '/admin/stop-list', label: 'Стоп-лист' },
  { href: '/admin/lunch', label: 'Бизнес-ланч' },
  { href: '/admin/events', label: 'Афиша' },
  { href: '/admin/users', label: 'Доступы' },
]

/** Навигация админки с подсветкой текущего раздела. */
export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Разделы админки" className="border-t border-forest-500/40">
      <div className="container-page no-scrollbar flex gap-1 overflow-x-auto">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-11 shrink-0 border-b-2 px-3 py-3 text-[0.8125rem] transition-colors ${
                isActive
                  ? 'border-brass text-kraft-100'
                  : 'border-transparent text-kraft-300 hover:text-kraft-100'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
