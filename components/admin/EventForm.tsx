'use client'

import { useState } from 'react'
import { saveEventAction } from '@/app/admin/actions'
import { ImageField, type ImageValue } from '@/components/admin/ImageField'
import { inputClass, labelClass } from '@/components/admin/ui'
import { buttonClass } from '@/components/ui/Button'

/**
 * Форма публикации афиши.
 *
 * Главное отличие от обычного «мероприятия»: дата и заголовок необязательны.
 * Если заполнить только фото и подпись — получится пост, ровно как в соцсетях.
 * Если указать дату — публикация встанет в расписание и получит своё место
 * в списке ближайших событий.
 */

export type EventFormData = {
  id: string
  title: string | null
  description: string | null
  startsAt: string
  price: string
  priceNote: string | null
  bookingPhone: string | null
  image: ImageValue | null
  isPublished: boolean
  sortOrder: string
}

export function EventForm({ event }: { event?: EventFormData }) {
  const [image, setImage] = useState<ImageValue | null>(event?.image ?? null)

  return (
    <form action={saveEventAction} className="grid gap-4 sm:grid-cols-2">
      {event && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="imagePath" value={image?.path ?? ''} />

      <label className="block sm:col-span-2">
        <span className={labelClass}>Подпись</span>
        <textarea
          name="description"
          rows={6}
          placeholder="Вставьте текст анонса — можно прямо из соцсетей."
          defaultValue={event?.description ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Заголовок (необязательно)</span>
        <input name="title" defaultValue={event?.title ?? ''} className={inputClass} />
      </label>

      <label className="block">
        <span className={labelClass}>Дата и время (если есть)</span>
        <input
          name="startsAt"
          type="datetime-local"
          defaultValue={event?.startsAt ?? ''}
          className={inputClass}
        />
      </label>

      <div className="sm:col-span-2">
        <ImageField
          value={image}
          onChange={setImage}
          hint="Можно оставить только фото и подпись — получится пост, как в соцсетях."
        />
      </div>

      <label className="block">
        <span className={labelClass}>Цена, ₽ (необязательно)</span>
        <input
          name="price"
          inputMode="decimal"
          defaultValue={event?.price ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Уточнение к цене</span>
        <input
          name="priceNote"
          placeholder="вход свободный, депозит 1500 ₽"
          defaultValue={event?.priceNote ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Телефон для брони</span>
        <input
          name="bookingPhone"
          placeholder="+7 (926) 000-00-00"
          defaultValue={event?.bookingPhone ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Порядок (меньше — выше)</span>
        <input
          name="sortOrder"
          type="number"
          step={10}
          defaultValue={event?.sortOrder ?? '0'}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 self-end pb-2">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={event?.isPublished ?? true}
          className="h-4 w-4 accent-[#1f3a2c]"
        />
        <span className="text-sm text-ink">Показывать на сайте</span>
      </label>

      <div className="sm:col-span-2">
        <button type="submit" className={buttonClass('primary')}>
          {event ? 'Сохранить публикацию' : 'Опубликовать в афише'}
        </button>
      </div>
    </form>
  )
}
