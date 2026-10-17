'use client'

import { useId, useState } from 'react'
import { formatPrice } from '@/lib/format'
import type { MenuVariant } from '@/lib/menu'

/**
 * Выбор варианта блюда: пицца 30 / 40 см, порция или половина.
 *
 * Сделано на настоящих радиокнопках, а не на кнопках с состоянием:
 *  - с клавиатуры выбирается стрелками, как положено группе переключателей;
 *  - скринридер объявляет вариант с ценой: цена лежит в подписи, пусть и
 *    невидимой — гость на слух не должен догадываться, сколько стоит размер;
 *  - без JavaScript группа честно показывает все размеры, просто не
 *    переключается — страница не ломается.
 *
 * Цены всех вариантов остаются в разметке: они нужны и поиску, и скринридеру.
 */

type Props = {
  variants: MenuVariant[]
  /** Индекс варианта по умолчанию: с него начинается выбор */
  defaultIndex: number
  /** Вызывается при выборе — карточка переставляет цену внизу */
  onSelect?: (variant: MenuVariant, index: number) => void
  /** Выключено, если блюда нет в наличии */
  disabled?: boolean
}

export function VariantPicker({ variants, defaultIndex, onSelect, disabled = false }: Props) {
  const groupId = useId()
  const [selected, setSelected] = useState(() =>
    defaultIndex >= 0 && defaultIndex < variants.length ? defaultIndex : 0,
  )

  function choose(index: number) {
    setSelected(index)
    const variant = variants[index]
    if (variant) onSelect?.(variant, index)
  }

  const selectedVariant = variants[selected]

  return (
    <fieldset className="mt-3 min-w-0" disabled={disabled}>
      <legend className="sr-only">Размер и цена</legend>

      <div className="grid grid-cols-2 gap-2">
        {variants.map((variant, index) => {
          const isSelected = index === selected
          const price = formatPrice(variant.price)

          return (
            <label
              key={`${variant.label}-${index}`}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-brand border px-3 text-center text-[0.8125rem] font-medium transition-colors ${
                isSelected
                  ? 'border-forest-700 bg-forest-700 text-kraft-100'
                  : 'border-kraft-300 bg-kraft-100/60 text-ink hover:border-brass'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input
                type="radio"
                name={`variant-${groupId}`}
                value={variant.label}
                checked={isSelected}
                onChange={() => choose(index)}
                className="sr-only"
              />
              <span>{variant.label}</span>
              {/* Цена для скринридера и поиска: визуально её показывает
                  строка под кнопками, но прозвучать она должна здесь. */}
              {price && <span className="sr-only">, {price}</span>}
            </label>
          )
        })}
      </div>

      {/* Уточнение к цене выбранного варианта. Вес и цену карточка уже
          показывает внизу — второй раз их не повторяем. */}
      {selectedVariant?.priceNote && (
        <p className="mt-2 text-[0.75rem] text-ink-soft">{selectedVariant.priceNote}</p>
      )}
    </fieldset>
  )
}
