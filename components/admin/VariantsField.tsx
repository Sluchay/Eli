'use client'

import { useState } from 'react'
import { CloseIcon } from '@/components/ui/icons'
import { inputClass, labelClass, smallButtonClass } from '@/components/admin/ui'
import { kopecksToInput } from '@/lib/money'
import type { MenuVariant } from '@/lib/menu'

/**
 * Варианты блюда в админке: размеры пиццы, порция/половина.
 *
 * Почему не «добавить ещё одно блюдо на каждый размер»: гость не должен
 * сравнивать «Маргарита, 30 см» и «Маргарита, 40 см» как две разные позиции.
 * В меню это одна карточка с переключателем, а размеры живут здесь.
 *
 * Форма отправляет в скрытое поле JSON. Так сервер получает варианты одной
 * структурой, не разбирая нумерованные поля вроде «variant-1-price».
 *
 * В каждом варианте можно менять ровно то, что отличается от размера к
 * размеру: цену, вес и уточнение к цене. Описание у блюда общее — так не
 * приходится переписывать состав у каждого размера. Но если у размера
 * правда другая подача или состав, поле для него есть (свёрнуто).
 */

type Row = {
  /** Ключ строки только для React, в данные не попадает */
  key: string
  label: string
  /** Цена в рублях строкой — как её вводит человек */
  price: string
  weight: string
  priceNote: string
  description: string
  isDefault: boolean
}

function toRows(variants: MenuVariant[]): Row[] {
  return variants.map((variant, index) => ({
    key: `row-${index}`,
    label: variant.label,
    price: kopecksToInput(variant.price),
    weight: variant.weight ?? '',
    priceNote: variant.priceNote ?? '',
    description: variant.description ?? '',
    isDefault: variant.isDefault === true,
  }))
}

function newRow(): Row {
  return {
    key: `row-${Math.random().toString(36).slice(2, 9)}`,
    label: '',
    price: '',
    weight: '',
    priceNote: '',
    description: '',
    isDefault: false,
  }
}

/** Собирает JSON для скрытого поля: пустые строки в базу не уходят. */
function toJson(rows: Row[]): string {
  const cleaned = rows
    .filter((row) => row.label.trim() !== '')
    .map((row) => {
      const price = Number.parseFloat(row.price.replace(',', '.'))

      return {
        label: row.label.trim(),
        price: Number.isFinite(price) && price > 0 ? price : null,
        weight: row.weight.trim() || null,
        priceNote: row.priceNote.trim() || null,
        description: row.description.trim() || null,
        isDefault: row.isDefault,
      }
    })

  return JSON.stringify(cleaned)
}

type Props = {
  /** Начальные варианты блюда */
  value: MenuVariant[]
  hint?: string
}

export function VariantsField({ value, hint }: Props) {
  const [rows, setRows] = useState<Row[]>(() => toRows(value))

  function update(index: number, patch: Partial<Row>) {
    setRows((previous) =>
      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    )
  }

  /** «По умолчанию» — ровно один размер: именно его увидит гость первым. */
  function setDefault(index: number) {
    setRows((previous) =>
      previous.map((row, rowIndex) => ({ ...row, isDefault: rowIndex === index })),
    )
  }

  function add() {
    setRows((previous) => {
      const next = [...previous, newRow()]
      // Первый добавленный размер сразу делаем основным
      if (previous.length === 0 && next[0]) next[0].isDefault = true
      return next
    })
  }

  function remove(index: number) {
    setRows((previous) => {
      const next = previous.filter((_, rowIndex) => rowIndex !== index)
      // Если убрали основной размер, основным становится первый оставшийся
      if (next.length > 0 && !next.some((row) => row.isDefault) && next[0]) {
        next[0].isDefault = true
      }
      return next
    })
  }

  return (
    <div>
      <span className={labelClass}>Размеры и варианты</span>

      <input type="hidden" name="variants" value={toJson(rows)} />

      <p className="mt-1 text-xs text-ink-soft">
        {hint ??
          'Например «30 см» и «40 см» у пиццы. Гость выбирает размер в одной карточке, а цена и вес меняются.'}
      </p>

      {rows.length === 0 ? (
        <p className="mt-3 rounded-brand border border-dashed border-kraft-400 px-3 py-3 text-xs text-ink-soft">
          Вариантов пока нет — блюдо показывается с одной ценой.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <li key={row.key} className="rounded-brand border border-kraft-300 bg-white/40 p-3">
              <div className="grid gap-2 sm:grid-cols-[6rem_minmax(0,1fr)_7rem]">
                <label className="block">
                  <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-soft">
                    Размер
                  </span>
                  <input
                    value={row.label}
                    onChange={(event) => update(index, { label: event.target.value })}
                    placeholder="30 см"
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-soft">
                    Цена, ₽
                  </span>
                  <input
                    value={row.price}
                    onChange={(event) => update(index, { price: event.target.value })}
                    inputMode="decimal"
                    placeholder="690"
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-soft">
                    Вес
                  </span>
                  <input
                    value={row.weight}
                    onChange={(event) => update(index, { weight: event.target.value })}
                    placeholder="480 г"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-soft">
                    Подпись к цене
                  </span>
                  <input
                    value={row.priceNote}
                    onChange={(event) => update(index, { priceNote: event.target.value })}
                    placeholder="необязательно"
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-soft">
                    Своё описание размера
                  </span>
                  <input
                    value={row.description}
                    onChange={(event) => update(index, { description: event.target.value })}
                    placeholder="необязательно"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="flex min-h-9 cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="default-variant"
                    checked={row.isDefault}
                    onChange={() => setDefault(index)}
                    className="h-4 w-4 accent-[#1f3a2c]"
                  />
                  <span className="text-[0.75rem] text-ink">Показывать цену этого размера</span>
                </label>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-auto inline-flex min-h-9 items-center gap-1.5 px-2 text-[0.6875rem] uppercase tracking-[0.1em] text-berry transition-colors hover:text-ink"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                  Убрать
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={add} className={`${smallButtonClass} mt-3`}>
        + Добавить размер
      </button>
    </div>
  )
}
