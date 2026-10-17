'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pinecone } from '@/components/brand/Ornament'
import { MenuItemCard } from '@/components/public/menu/MenuItemCard'
import { buttonClass } from '@/components/ui/Button'
import { ArrowUpIcon, CloseIcon, SearchIcon } from '@/components/ui/icons'
import { dishesLabel } from '@/lib/format'
import { BADGE_FILTERS, type MenuSectionView } from '@/lib/menu'

/**
 * Всё меню — одна страница.
 *
 * Почему так, а не отдельные страницы разделов: разделы это данные, а не
 * маршруты. Если раздел станет отдельным URL, добавление раздела потребует
 * правок кода, а гость по QR попадёт не в полное меню. Здесь же всё меню
 * приходит в первом HTML-ответе (текст меню читается даже без картинок),
 * а клиентский JS отвечает только за поиск, фильтры и подсветку раздела.
 */

type Props = {
  sections: MenuSectionView[]
}

export function MenuBrowser({ sections }: Props) {
  const [query, setQuery] = useState('')
  const [activeBadges, setActiveBadges] = useState<string[]>([])
  const [activeSection, setActiveSection] = useState(sections[0]?.slug ?? '')
  const [showTop, setShowTop] = useState(false)

  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchesQuery =
            needle.length === 0 ||
            item.name.toLowerCase().includes(needle) ||
            (item.description?.toLowerCase().includes(needle) ?? false)

          const matchesBadges = activeBadges.every((code) => item.badges.includes(code))

          return matchesQuery && matchesBadges
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [sections, query, activeBadges])

  const total = useMemo(
    () => filtered.reduce((sum, section) => sum + section.items.length, 0),
    [filtered],
  )

  const hasFilters = query.trim().length > 0 || activeBadges.length > 0

  const clearFilters = useCallback(() => {
    setQuery('')
    setActiveBadges([])
  }, [])

  const scrollToSection = useCallback((slug: string) => {
    const element = document.getElementById(`section-${slug}`)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(slug)
  }, [])

  const toggleBadge = useCallback((code: string) => {
    setActiveBadges((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    )
  }, [])

  /* Подсветка текущего раздела при скролле */
  useEffect(() => {
    const elements = filtered
      .map((section) => document.getElementById(`section-${section.slug}`))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = entry.target.getAttribute('data-slug')
          if (!slug) continue
          if (entry.isIntersecting) {
            visible.set(slug, entry.boundingClientRect.top)
          } else {
            visible.delete(slug)
          }
        }

        let best: string | null = null
        let bestTop = Number.POSITIVE_INFINITY
        for (const [slug, top] of visible) {
          if (top < bestTop) {
            bestTop = top
            best = slug
          }
        }

        if (best && bestTop < window.innerHeight * 0.6) {
          setActiveSection(best)
        }
      },
      { rootMargin: '-120px 0px -35% 0px', threshold: 0 },
    )

    for (const element of elements) observer.observe(element)

    return () => observer.disconnect()
  }, [filtered])

  /* Активный чип подтягиваем в видимую часть ленты */
  useEffect(() => {
    chipRefs.current[activeSection]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    })
  }, [activeSection])

  /* Кнопка «наверх» появляется после первого экрана */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/70" />
          <label htmlFor="menu-search" className="sr-only">
            Поиск по меню
          </label>
          <input
            id="menu-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск: лосось, грибы, цезарь…"
            className="min-h-11 w-full rounded-brand border border-kraft-300 bg-kraft-100/80 py-2 pl-9 pr-9 text-[0.9375rem] text-ink placeholder:text-ink-soft/60 focus:border-brass focus:outline-none"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-brand text-ink-soft transition-colors hover:text-forest-700"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {BADGE_FILTERS.map((filter) => {
            const isActive = activeBadges.includes(filter.code)
            return (
              <button
                key={filter.code}
                type="button"
                onClick={() => toggleBadge(filter.code)}
                aria-pressed={isActive}
                className={`min-h-9 rounded-brand border px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? 'border-forest-700 bg-forest-700 text-kraft-100'
                    : 'border-kraft-300 text-ink-soft hover:border-brass hover:text-forest-700'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-4 text-sm text-ink-soft">
        {hasFilters ? `Найдено: ${dishesLabel(total)}` : `Всего ${dishesLabel(total)} в ${sections.length} разделах`}
      </p>

      {/* Липкая навигация по разделам */}
      <div className="sticky top-16 z-30 -mx-5 mt-4 border-y border-kraft-300/70 bg-kraft-100/95 px-5 backdrop-blur-sm sm:-mx-8 sm:px-8">
        <nav aria-label="Разделы меню" className="no-scrollbar flex gap-2 overflow-x-auto py-3">
          {filtered.map((section) => {
            const isActive = activeSection === section.slug
            return (
              <button
                key={section.slug}
                ref={(element) => {
                  chipRefs.current[section.slug] = element
                }}
                type="button"
                onClick={() => scrollToSection(section.slug)}
                aria-current={isActive ? 'true' : undefined}
                className={`min-h-9 shrink-0 rounded-brand border px-3.5 font-body text-[0.8125rem] transition-colors ${
                  isActive
                    ? 'border-brass bg-brass/12 font-medium text-forest-700'
                    : 'border-transparent text-ink-soft hover:text-forest-700'
                }`}
              >
                {section.title}
              </button>
            )
          })}
        </nav>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-brand border border-dashed border-kraft-400 py-16 text-center">
          <Pinecone className="mx-auto h-10 w-auto text-kraft-400" />
          <p className="mt-5 font-heading text-xl text-forest-700">Ничего не нашлось</p>
          <p className="mt-2 text-sm text-ink-soft">
            Попробуйте другое слово или сбросьте фильтры — в меню есть из чего выбрать.
          </p>
          <button type="button" onClick={clearFilters} className={`${buttonClass('outline')} mt-6`}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="mt-12 space-y-14">
          {filtered.map((section) => (
            <section
              key={section.slug}
              id={`section-${section.slug}`}
              data-slug={section.slug}
              className="scroll-mt-32"
            >
              <header className="border-b border-kraft-300/70 pb-4">
                <h2 className="font-heading text-2xl text-forest-700 sm:text-3xl">{section.title}</h2>
                {section.description && (
                  <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
                    {section.description}
                  </p>
                )}
                {section.availableFrom && section.availableTo && (
                  <p className="mt-2 text-[0.75rem] uppercase tracking-[0.14em] text-brass">
                    Подаём с {section.availableFrom} до {section.availableTo}
                  </p>
                )}
              </header>

              {/* Две колонки уже на телефоне: в одну колонку карточка с фото
                  выглядит мелко, а в две кадр ~145 px и блюдо видно. */}
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {section.items.map((item) => (
                  <li key={item.id} className="h-full">
                    <MenuItemCard item={item} iconKey={section.iconKey} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Вернуться наверх"
          className="fixed bottom-6 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-brand border border-kraft-400 bg-kraft-100/95 text-forest-700 shadow-sm backdrop-blur transition-colors hover:border-brass"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </>
  )
}
