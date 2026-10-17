'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { ChevronDownIcon, MenuListIcon, PhoneIcon } from '@/components/ui/icons'
import { buttonClass } from '@/components/ui/Button'
import { SITE } from '@/lib/site'

/**
 * Навигация для телефона.
 *
 * Зачем: на узком экране основной блок ссылок скрыт (иначе шапка не влезает),
 * и до «Афиши» и «Бизнес-ланча» с телефона было не добраться вообще —
 * только до меню через кнопку. Гость, пришедший из соцсетей, в первую очередь
 * хочет как раз афишу, поэтому это была дыра, а не оформление.
 *
 * Почему всплывающая панель, а не выдвижной ящик на пол-экрана: пунктов четыре,
 * и они должны мгновенно читаться. Полноэкранное меню для четырёх ссылок
 * заставляет делать лишнее движение.
 *
 * Панель закрывается сама: по ссылке, по Esc, по затемнённому фону и при смене
 * страницы. Прокрутка страницы под открытой панелью заблокирована, чтобы
 * открытое меню не «уезжало».
 */

const NAV = [
  { href: '/menu', label: 'Меню', hint: 'Все разделы и цены' },
  { href: '/lunch', label: 'Бизнес-ланч', hint: 'Обед по будням' },
  { href: '/events', label: 'Афиша', hint: 'Живая музыка и праздники' },
  { href: '/#contacts', label: 'Контакты', hint: 'Адрес, часы и телефон' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  const pathname = usePathname()

  // Перешли на другую страницу — панель больше не нужна
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Прокрутка страницы не уезжает под открытой панелью
  useEffect(() => {
    if (!isOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  // Esc закрывает панель — привычное поведение
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/#')) return false
    return pathname === href
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню' }
        className="inline-flex h-11 w-11 items-center justify-center rounded-brand text-forest-700 transition-colors hover:bg-kraft-200"
      >
        {isOpen ? <ChevronDownIcon className="h-5 w-5" /> : <MenuListIcon className="h-5 w-5" />}
      </button>

      {isOpen && (
        <>
          {/* Затемнение: нажатие закрывает меню */}
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 top-[65px] z-30 cursor-default bg-forest-900/30"
          />

          <div
            id={panelId}
            className="absolute inset-x-0 top-full z-40 border-b border-kraft-300 bg-kraft-100 shadow-lg"
          >
            <nav aria-label="Основная навигация" className="container-page py-2">
              <ul className="divide-y divide-kraft-300/60">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={`flex min-h-14 items-center justify-between gap-3 transition-colors hover:text-forest-700 ${
                        isActive(item.href) ? 'text-forest-700' : 'text-ink'
                      }`}
                    >
                      <span>
                        <span className="block font-body text-[0.9375rem] font-medium uppercase tracking-[0.1em]">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[0.75rem] normal-case tracking-normal text-ink-soft">
                          {item.hint}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 py-3">
                <a href={SITE.phoneHref} className={buttonClass('primary')}>
                  <PhoneIcon className="h-4 w-4" />
                  Позвонить
                </a>
                <span className="tnum text-[0.8125rem] text-ink-soft">{SITE.phoneDisplay}</span>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
