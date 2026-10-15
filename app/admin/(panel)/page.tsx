import Link from 'next/link'
import { prisma } from '@/lib/db'
import { dishesLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** Сводка: что происходит в меню прямо сейчас. */
export default async function AdminDashboardPage() {
  const [items, hiddenItems, stopItems, sections, lunches, events] = await Promise.all([
    prisma.menuItem.count(),
    prisma.menuItem.count({ where: { isVisible: false } }),
    prisma.menuItem.count({ where: { isStopList: true } }),
    prisma.menuSection.count(),
    prisma.businessLunch.count(),
    prisma.event.count(),
  ])

  const cards = [
    { label: 'Блюд в меню', value: String(items), hint: dishesLabel(items), href: '/admin/menu' },
    { label: 'Разделов', value: String(sections), hint: 'в меню на сайте', href: '/admin/menu' },
    {
      label: 'Нет в наличии',
      value: String(stopItems),
      hint: stopItems > 0 ? 'гости видят плашку' : 'всё есть',
      href: '/admin/stop-list',
    },
    {
      label: 'Скрыто',
      value: String(hiddenItems),
      hint: 'не показываются гостям',
      href: '/admin/menu',
    },
    { label: 'Позиций ланча', value: String(lunches), hint: 'на странице /lunch', href: '/admin/lunch' },
    { label: 'Публикаций афиши', value: String(events), hint: 'на странице /events', href: '/admin/events' },
  ]

  return (
    <>
      <h1 className="font-heading text-3xl text-forest-700">Сводка</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Здесь всё, что можно менять без разработчика. Изменения появляются на сайте сразу.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className="block h-full rounded-brand border border-kraft-300 bg-kraft-100/70 p-5 transition-colors hover:border-brass"
            >
              <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">{card.label}</p>
              <p className="tnum mt-2 font-heading text-3xl text-forest-700">{card.value}</p>
              <p className="mt-1 text-xs text-ink-soft">{card.hint}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/stop-list" className="rounded-brand border border-kraft-400 px-4 py-2.5 text-[0.75rem] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass">
          Отметить стоп-лист
        </Link>
        <Link href="/admin/menu" className="rounded-brand border border-kraft-400 px-4 py-2.5 text-[0.75rem] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass">
          Открыть меню
        </Link>
        <Link href="/menu" className="rounded-brand border border-kraft-400 px-4 py-2.5 text-[0.75rem] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass">
          Посмотреть, как видят гости
        </Link>
      </div>
    </>
  )
}
