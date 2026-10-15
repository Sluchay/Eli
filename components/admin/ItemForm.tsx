'use client'

import { useState } from 'react'
import { deleteItemAction, saveItemAction } from '@/app/admin/actions'
import { ImageField, type ImageValue } from '@/components/admin/ImageField'
import { cardClass, inputClass, labelClass } from '@/components/admin/ui'
import { MenuItemCard } from '@/components/public/menu/MenuItemCard'
import { buttonClass } from '@/components/ui/Button'
import { ALLERGEN_LABELS, BADGES, type MenuItemView } from '@/lib/menu'
import { inputToKopecks } from '@/lib/money'

/**
 * Форма блюда с живым предпросмотром.
 *
 * Справа всё время видна карточка ровно в том виде, в каком её увидит гость.
 * Это снимает главный страх владельца — «а как это будет выглядеть» — и заодно
 * сразу показывает, если поле заполнено странно.
 */

const BADGE_CODES = Object.keys(BADGES)
const ALLERGEN_CODES = Object.keys(ALLERGEN_LABELS)

export type ItemFormValues = {
  id: string | null
  sectionId: string
  name: string
  description: string
  price: string
  priceNote: string
  weight: string
  volume: string
  composition: string
  allergens: string[]
  calories: string
  protein: string
  fat: string
  carbs: string
  badges: string[]
  isVisible: boolean
  isStopList: boolean
  sortOrder: string
  image: ImageValue | null
}

export type SectionOption = {
  id: string
  title: string
  iconKey: string
}

function toNumber(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function ItemForm({ values, sections }: { values: ItemFormValues; sections: SectionOption[] }) {
  const [state, setState] = useState<ItemFormValues>(values)

  function setField<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setState((previous) => ({ ...previous, [key]: value }))
  }

  function toggleInList(key: 'badges' | 'allergens', code: string) {
    setState((previous) => {
      const list = previous[key]
      return {
        ...previous,
        [key]: list.includes(code) ? list.filter((item) => item !== code) : [...list, code],
      }
    })
  }

  const activeSection = sections.find((section) => section.id === state.sectionId) ?? sections[0]
  const hasNutrition = Boolean(state.calories || state.protein || state.fat || state.carbs)

  const preview: MenuItemView = {
    id: 'preview',
    name: state.name.trim() || 'Название блюда',
    description: state.description.trim() || null,
    price: inputToKopecks(state.price),
    priceNote: state.priceNote.trim() || null,
    weight: state.weight.trim() || null,
    volume: state.volume.trim() || null,
    composition: state.composition.trim() || null,
    allergens: state.allergens,
    nutrition: hasNutrition
      ? {
          kcal: toNumber(state.calories),
          protein: toNumber(state.protein),
          fat: toNumber(state.fat),
          carbs: toNumber(state.carbs),
        }
      : null,
    badges: state.badges,
    isStopList: state.isStopList,
    image: state.image ? { ...state.image, alt: state.name } : null,
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form action={saveItemAction} className="space-y-8">
        {state.id && <input type="hidden" name="id" value={state.id} />}
        <input type="hidden" name="imagePath" value={state.image?.path ?? ''} />
        <input type="hidden" name="imageWidth" value={state.image?.width ?? ''} />
        <input type="hidden" name="imageHeight" value={state.image?.height ?? ''} />

        <section className={cardClass}>
          <h2 className="font-heading text-xl text-forest-700">Главное</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Обязательны только раздел и название. Всё остальное можно не заполнять — карточка
            выглядит аккуратно в любом случае.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Название *</span>
              <input
                name="name"
                required
                value={state.name}
                onChange={(event) => setField('name', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Раздел *</span>
              <select
                name="sectionId"
                required
                value={state.sectionId}
                onChange={(event) => setField('sectionId', event.target.value)}
                className={inputClass}
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Цена, ₽</span>
              <input
                name="price"
                inputMode="decimal"
                placeholder="690"
                value={state.price}
                onChange={(event) => setField('price', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className={labelClass}>Описание</span>
              <textarea
                name="description"
                rows={3}
                value={state.description}
                onChange={(event) => setField('description', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Вес</span>
              <input
                name="weight"
                placeholder="240 г"
                value={state.weight}
                onChange={(event) => setField('weight', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Объём</span>
              <input
                name="volume"
                placeholder="0,4 л"
                value={state.volume}
                onChange={(event) => setField('volume', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className={labelClass}>Уточнение к цене</span>
              <input
                name="priceNote"
                placeholder="за 100 г, по будням до 16:00"
                value={state.priceNote}
                onChange={(event) => setField('priceNote', event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="font-heading text-xl text-forest-700">Метки</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Показываются на карточке. Если ничего не отметить — карточка просто будет без меток.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {BADGE_CODES.map((code) => {
              const badge = BADGES[code]
              if (!badge) return null
              return (
                <label
                  key={code}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-brand border border-kraft-300 bg-white/50 px-3"
                >
                  <input
                    type="checkbox"
                    name="badges"
                    value={code}
                    checked={state.badges.includes(code)}
                    onChange={() => toggleInList('badges', code)}
                    className="h-4 w-4 accent-[#1f3a2c]"
                  />
                  <span className="text-sm text-ink">{badge.label}</span>
                </label>
              )
            })}
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="font-heading text-xl text-forest-700">Состав и пищевая ценность</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Это прячется в карточке под кнопкой «Подробнее». На сайт попадёт только заполненное.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className={labelClass}>Состав</span>
              <textarea
                name="composition"
                rows={3}
                placeholder="Оленина, морковь, кедровый орех, брусника…"
                value={state.composition}
                onChange={(event) => setField('composition', event.target.value)}
                className={inputClass}
              />
            </label>

            <div>
              <span className={labelClass}>Аллергены</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALLERGEN_CODES.map((code) => (
                  <label
                    key={code}
                    className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-brand border px-3 ${
                      state.allergens.includes(code)
                        ? 'border-berry/50 bg-berry/10'
                        : 'border-kraft-300 bg-white/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="allergens"
                      value={code}
                      checked={state.allergens.includes(code)}
                      onChange={() => toggleInList('allergens', code)}
                      className="h-4 w-4 accent-[#7a2e27]"
                    />
                    <span className="text-[0.8125rem] text-ink">{ALLERGEN_LABELS[code]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <label className="block">
                <span className={labelClass}>Ккал</span>
                <input
                  name="calories"
                  inputMode="numeric"
                  value={state.calories}
                  onChange={(event) => setField('calories', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Белки</span>
                <input
                  name="protein"
                  inputMode="decimal"
                  value={state.protein}
                  onChange={(event) => setField('protein', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Жиры</span>
                <input
                  name="fat"
                  inputMode="decimal"
                  value={state.fat}
                  onChange={(event) => setField('fat', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Углеводы</span>
                <input
                  name="carbs"
                  inputMode="decimal"
                  value={state.carbs}
                  onChange={(event) => setField('carbs', event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="font-heading text-xl text-forest-700">Фото и показ</h2>

          <div className="mt-5 space-y-5">
            <ImageField
              value={state.image}
              onChange={(image) => setField('image', image)}
              hint="Без фото карточка покажет гравюрную иконку раздела — это нормально и выглядит цельно."
            />

            <label className="block max-w-[12rem]">
              <span className={labelClass}>Порядок в разделе</span>
              <input
                name="sortOrder"
                type="number"
                step={10}
                value={state.sortOrder}
                onChange={(event) => setField('sortOrder', event.target.value)}
                className={inputClass}
              />
            </label>

            <div className="flex flex-wrap gap-5">
              <label className="flex min-h-11 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={state.isVisible}
                  onChange={(event) => setField('isVisible', event.target.checked)}
                  className="h-4 w-4 accent-[#1f3a2c]"
                />
                <span className="text-sm text-ink">Показывать на сайте</span>
              </label>

              <label className="flex min-h-11 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="isStopList"
                  checked={state.isStopList}
                  onChange={(event) => setField('isStopList', event.target.checked)}
                  className="h-4 w-4 accent-[#7a2e27]"
                />
                <span className="text-sm text-ink">Сейчас нет в наличии</span>
              </label>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={buttonClass('primary', 'lg')}>
            {state.id ? 'Сохранить блюдо' : 'Добавить блюдо'}
          </button>
          <a href="/admin/menu" className={buttonClass('outline', 'lg')}>
            Вернуться к меню
          </a>
        </div>
      </form>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <p className={labelClass}>Так увидит гость</p>
        <div className="mt-3">
          <MenuItemCard item={preview} iconKey={activeSection?.iconKey ?? 'starter'} />
        </div>

        {state.id && (
          <form action={deleteItemAction} className="mt-6 border-t border-kraft-300 pt-5">
            <input type="hidden" name="id" value={state.id} />
            <button
              type="submit"
              className="text-[0.6875rem] uppercase tracking-[0.1em] text-berry transition-colors hover:text-ink"
            >
              Удалить блюдо навсегда
            </button>
          </form>
        )}
      </aside>
    </div>
  )
}
