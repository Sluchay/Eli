'use client'

import { useState, type ReactElement } from 'react'
import { DishPhoto } from '@/components/public/menu/DishPhoto'
import { VariantPicker } from '@/components/public/menu/VariantPicker'
import {
  BowlIcon,
  CakeIcon,
  ChevronDownIcon,
  CupIcon,
  FishIcon,
  GlassIcon,
  JarIcon,
  LeafIcon,
  PizzaIcon,
  PotIcon,
  SpruceIcon,
  WheatIcon,
} from '@/components/ui/icons'
import { formatPrice } from '@/lib/format'
import { photoFrameStyle } from '@/lib/image-frame'
import { ALLERGEN_LABELS, BADGES, type MenuItemView, type MenuVariant } from '@/lib/menu'

/**
 * Карточка блюда.
 *
 * Главное требование к ней: выглядеть цельно при ЛЮБОЙ комбинации заполненных
 * полей. У владельца может быть только название и цена — и это нормально.
 * Поэтому:
 *  - кадр всегда одного формата 4:3 и во всю ширину карточки. Так он читается
 *    на телефоне: в две колонки это ~145 px, то есть вчетверо больше прежнего
 *    квадратика 80 px. По нажатию фото открывается целиком в окне;
 *  - при пустых полях ничего не рендерится (никаких «Вес: —»);
 *  - у блюда без фото тот же кадр занимает гравюрная иконка раздела — соседство
 *    «с фото / без фото» не должно читаться как брак;
 *  - название обрезается до двух строк, описание до трёх, полный текст
 *    раскрывается по кнопке «Подробнее» вместе с составом, аллергенами и КБЖУ;
 *  - блюдо из стоп-листа не исчезает, а гасится и получает плашку.
 */

const ICON_BY_SECTION: Record<string, (props: { className?: string }) => ReactElement> = {
  starter: JarIcon,
  salad: LeafIcon,
  soup: BowlIcon,
  pizza: PizzaIcon,
  pasta: WheatIcon,
  hot: PotIcon,
  side: SpruceIcon,
  dessert: CakeIcon,
  drink: CupIcon,
  bar: GlassIcon,
  fish: FishIcon,
}

const BADGE_STYLES: Record<string, string> = {
  hit: 'border-berry/40 bg-berry/10 text-berry',
  new: 'border-brass/50 bg-brass/12 text-brass',
  diet: 'border-moss-400/50 bg-moss-400/12 text-forest-500',
  spicy: 'border-berry/40 bg-transparent text-berry',
  local: 'border-forest-500/35 bg-forest-500/8 text-forest-500',
}

type Props = {
  item: MenuItemView
  /** Ключ иконки раздела — используется, когда у блюда нет фотографии */
  iconKey: string
}

export function MenuItemCard({ item, iconKey }: Props) {
  const Icon = ICON_BY_SECTION[iconKey] ?? BowlIcon

  /**
   * Выбранный вариант (размер пиццы). null — вариантов нет, показываем цену
   * самого блюда. Состояние живёт здесь, а не в VariantPicker, потому что от
   * него зависит цена внизу карточки: два места не должны спорить о цифре.
   *
   * Индекс по умолчанию считается сразу на сервере, поэтому правильная цена
   * видна уже в первом HTML-ответе, ещё до выполнения JS.
   */
  const defaultVariantIndex = item.variants.findIndex((variant) => variant.isDefault)
  const defaultIndex = defaultVariantIndex >= 0 ? defaultVariantIndex : 0
  // Вариантов нет — chosen остаётся null, карточка показывает цену блюда
  const [chosen, setChosen] = useState<MenuVariant | null>(
    () => item.variants[defaultIndex] ?? null,
  )

  const hasVariants = item.variants.length > 0

  // Цена, вес и подпись берутся у выбранного варианта, если он есть
  const price = formatPrice(chosen ? chosen.price : item.price)
  const activeWeight = chosen ? chosen.weight : null
  const activePriceNote = chosen ? chosen.priceNote : item.priceNote
  const description = chosen?.description ?? item.description

  const portion = [activeWeight ?? item.weight, activeWeight ? null : item.volume]
    .filter(Boolean)
    .join(' · ')
  const allergenLabels = item.allergens
    .map((code) => ALLERGEN_LABELS[code] ?? code)
    .filter(Boolean)

  const isLongDescription = (description?.length ?? 0) > 140
  const hasDetails = Boolean(
    item.composition || allergenLabels.length > 0 || item.nutrition || isLongDescription,
  )

  const visibleBadges = item.badges
    .map((code) => ({ code, ...(BADGES[code] ?? { label: code, tone: 'local' as const }) }))
    .slice(0, 2)

  const photo = item.image && item.image.path.startsWith('/') ? item.image : null

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-brand border border-kraft-300/80 bg-kraft-100/70 transition-colors ${
        item.isStopList ? 'border-dashed opacity-75' : 'hover:border-kraft-400'
      }`}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-kraft-200/50">
        {photo ? (
          <DishPhoto
            src={photo.path}
            alt={photo.alt ?? item.name}
            name={item.name}
            price={item.price}
            priceNote={item.priceNote}
            ratioStyle={photoFrameStyle(photo.width, photo.height)}
            label={`Увеличить фотографию блюда «${item.name}»`}
          />
        ) : (
          // Блюдо без фото: тот же кадр, тот же размер, гравюрная иконка раздела.
          <span className="flex h-full w-full items-center justify-center text-kraft-400">
            <Icon className="h-10 w-10 sm:h-12 sm:w-12" />
          </span>
        )}

        {item.isStopList && (
          <span className="absolute left-2 top-2 rounded-brand border border-berry/40 bg-kraft-100/95 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-berry">
            Нет в наличии
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 font-heading text-[1.0625rem] leading-snug text-forest-700 sm:text-lg">
          {item.name}
        </h3>

        {visibleBadges.length > 0 && (
          <ul className="mt-2 flex flex-wrap items-center gap-1.5">
            {visibleBadges.map((badge) => (
              <li
                key={badge.code}
                className={`rounded-brand border px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] ${
                  BADGE_STYLES[badge.tone] ?? BADGE_STYLES.local
                }`}
              >
                {badge.label}
              </li>
            ))}
          </ul>
        )}

        {hasVariants && (
          <VariantPicker
            variants={item.variants}
            defaultIndex={defaultIndex}
            onSelect={(variant) => setChosen(variant)}
            disabled={item.isStopList}
          />
        )}

        {description && (
          <p
            className={`mt-2 text-[0.875rem] leading-relaxed text-ink-soft ${
              isLongDescription ? 'line-clamp-3' : ''
            }`}
          >
            {description}
          </p>
        )}

        {hasDetails && (
          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-forest-700 [&::-webkit-details-marker]:hidden">
              Подробнее
              <ChevronDownIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-3 space-y-2 border-t border-kraft-300/70 pt-3 text-[0.8125rem] leading-relaxed text-ink-soft">
              {isLongDescription && description && <p>{description}</p>}

              {item.composition && (
                <p>
                  <span className="font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                    Состав:{' '}
                  </span>
                  {item.composition}
                </p>
              )}

              {allergenLabels.length > 0 && (
                <p>
                  <span className="font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                    Аллергены:{' '}
                  </span>
                  {allergenLabels.join(', ')}
                </p>
              )}

              {item.nutrition && (
                <p className="tnum">
                  <span className="font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
                    На порцию:{' '}
                  </span>
                  {item.nutrition.kcal} ккал · Б {item.nutrition.protein} · Ж {item.nutrition.fat} · У{' '}
                  {item.nutrition.carbs}
                </p>
              )}
            </div>
          </details>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-[0.75rem] text-ink-soft/85">{portion || ''}</p>
          <p className="text-right">
            {price ? (
              <span
                className={`price text-[1.0625rem] font-medium ${
                  item.isStopList ? 'text-ink-soft' : 'text-brass'
                }`}
              >
                {price}
              </span>
            ) : (
              <span className="text-[0.8125rem] text-ink-soft">
                {activePriceNote ?? 'цена по запросу'}
              </span>
            )}
            {price && activePriceNote && (
              <span className="block text-[0.6875rem] text-ink-soft/80">{activePriceNote}</span>
            )}
          </p>
        </div>
      </div>
    </article>
  )
}
