'use client'

import { useState } from 'react'
import { saveLunchAction } from '@/app/admin/actions'
import { ImageField, type ImageValue } from '@/components/admin/ImageField'
import { inputClass, labelClass } from '@/components/admin/ui'
import { buttonClass } from '@/components/ui/Button'

/**
 * Форма публикации бизнес-ланча.
 *
 * Идея простая: владелец копирует анонс из соцсетей и вставляет сюда —
 * картинку и текст. Ничего обязательного, кроме самого текста или фото.
 */

export type LunchFormData = {
  id: string
  title: string
  description: string | null
  price: string
  priceNote: string | null
  image: ImageValue | null
  validFrom: string
  validTo: string
  isPublished: boolean
  sortOrder: string
}

export function LunchForm({ lunch }: { lunch?: LunchFormData }) {
  const [image, setImage] = useState<ImageValue | null>(lunch?.image ?? null)

  return (
    <form action={saveLunchAction} className="grid gap-4 sm:grid-cols-2">
      {lunch && <input type="hidden" name="id" value={lunch.id} />}
      <input type="hidden" name="imagePath" value={image?.path ?? ''} />

      <label className="block sm:col-span-2">
        <span className={labelClass}>Заголовок</span>
        <input
          name="title"
          defaultValue={lunch?.title ?? 'Бизнес-ланч'}
          className={inputClass}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className={labelClass}>Описание</span>
        <textarea
          name="description"
          rows={5}
          placeholder="Суп дня, горячее с гарниром и морс. Состав меняется каждый день."
          defaultValue={lunch?.description ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Цена, ₽</span>
        <input
          name="price"
          inputMode="decimal"
          placeholder="490"
          defaultValue={lunch?.price ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Уточнение к цене</span>
        <input
          name="priceNote"
          placeholder="по будням до 16:00"
          defaultValue={lunch?.priceNote ?? ''}
          className={inputClass}
        />
      </label>

      <div className="sm:col-span-2">
        <ImageField
          value={image}
          onChange={setImage}
          hint="Анонс с картинкой из соцсетей выглядит лучше всего. Фото сжимается автоматически."
        />
      </div>

      <label className="block">
        <span className={labelClass}>Действует с (необязательно)</span>
        <input
          name="validFrom"
          type="date"
          defaultValue={lunch?.validFrom ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Действует по (необязательно)</span>
        <input name="validTo" type="date" defaultValue={lunch?.validTo ?? ''} className={inputClass} />
      </label>

      <label className="block">
        <span className={labelClass}>Порядок (меньше — выше)</span>
        <input
          name="sortOrder"
          type="number"
          step={10}
          defaultValue={lunch?.sortOrder ?? '0'}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 self-end pb-2">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={lunch?.isPublished ?? true}
          className="h-4 w-4 accent-[#1f3a2c]"
        />
        <span className="text-sm text-ink">Показывать на сайте</span>
      </label>

      <div className="sm:col-span-2">
        <button type="submit" className={buttonClass('primary')}>
          {lunch ? 'Сохранить ланч' : 'Опубликовать ланч'}
        </button>
      </div>
    </form>
  )
}
