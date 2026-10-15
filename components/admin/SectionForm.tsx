import { saveSectionAction } from '@/app/admin/actions'
import { buttonClass } from '@/components/ui/Button'
import { inputClass, labelClass } from '@/components/admin/ui'

/**
 * Иконка раздела нужна только для блюд без фотографии: она подставляется
 * в квадрат вместо картинки. Названия иконок описаны по форме, а не по
 * разделам, потому что «Салаты» вполне могут выбрать чашу.
 */
const ICON_OPTIONS = [
  { value: 'starter', label: 'Банка — закуски' },
  { value: 'salad', label: 'Лист — салаты и зелень' },
  { value: 'soup', label: 'Чаша — супы' },
  { value: 'pizza', label: 'Кусок пиццы' },
  { value: 'pasta', label: 'Колосья — паста' },
  { value: 'hot', label: 'Кастрюля — горячее' },
  { value: 'side', label: 'Ель — гарниры' },
  { value: 'dessert', label: 'Торт — десерты' },
  { value: 'drink', label: 'Чашка — напитки' },
  { value: 'bar', label: 'Бокал — бар' },
  { value: 'fish', label: 'Рыба' },
]

export type SectionFormData = {
  id: string
  title: string
  description: string | null
  iconKey: string | null
  availableFrom: string | null
  availableTo: string | null
  sortOrder: number
  isVisible: boolean
}

export function SectionForm({ section }: { section?: SectionFormData }) {
  return (
    <form action={saveSectionAction} className="grid gap-4 sm:grid-cols-2">
      {section && <input type="hidden" name="id" value={section.id} />}

      <label className="block">
        <span className={labelClass}>Название раздела *</span>
        <input name="title" required defaultValue={section?.title ?? ''} className={inputClass} />
      </label>

      <label className="block">
        <span className={labelClass}>Иконка для блюд без фото</span>
        <select name="iconKey" defaultValue={section?.iconKey ?? 'starter'} className={inputClass}>
          {ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className={labelClass}>Подпись под заголовком (необязательно)</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={section?.description ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Подаём с (для ланча)</span>
        <input
          name="availableFrom"
          type="time"
          defaultValue={section?.availableFrom ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Подаём до</span>
        <input
          name="availableTo"
          type="time"
          defaultValue={section?.availableTo ?? ''}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Порядок (меньше — выше)</span>
        <input
          name="sortOrder"
          type="number"
          step={10}
          defaultValue={section?.sortOrder ?? 0}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 self-end pb-2">
        <input
          type="checkbox"
          name="isVisible"
          defaultChecked={section?.isVisible ?? true}
          className="h-4 w-4 accent-[#1f3a2c]"
        />
        <span className="text-sm text-ink">Показывать на сайте</span>
      </label>

      <div className="sm:col-span-2">
        <button type="submit" className={buttonClass('primary')}>
          {section ? 'Сохранить раздел' : 'Создать раздел'}
        </button>
      </div>
    </form>
  )
}
