/**
 * Форматирование цен, дат и числительных — в одном месте.
 * Правильные склонения и русские форматы не должны быть раскиданы по компонентам.
 */

const CURRENCY_GAP = '\u00A0'

/** Цена хранится в копейках. 69000 → «690 ₽» */
export function formatPrice(kopecks: number | null | undefined, currency = '₽'): string | null {
  if (kopecks === null || kopecks === undefined) return null

  const hasFraction = kopecks % 100 !== 0
  const rubles = kopecks / 100

  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(rubles)

  return `${formatted}${CURRENCY_GAP}${currency}`
}

/** 1 блюдо, 2 блюда, 5 блюд */
export function plural(count: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(count) % 100
  const last = abs % 10

  if (abs > 10 && abs < 20) return forms[2]!
  if (last > 1 && last < 5) return forms[1]!
  if (last === 1) return forms[0]!
  return forms[2]!
}

export function dishesLabel(count: number): string {
  return `${count} ${plural(count, ['блюдо', 'блюда', 'блюд'])}`
}

const TIME_ZONE = process.env.TZ ?? 'Europe/Moscow'

/** «17 октября, пятница · 20:00» */
export function formatEventDateTime(date: Date): string {
  const day = new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'long',
  }).format(date)

  const weekday = new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIME_ZONE,
    weekday: 'long',
  }).format(date)

  const time = new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return `${day}, ${weekday} · ${time}`
}

/** «сегодня» / «завтра» / «через 5 дней» — для афиши */
export function humanDayDelta(date: Date, now: Date = new Date()): string {
  const dayMs = 24 * 60 * 60 * 1000
  const startOfDay = (value: Date) =>
    Math.floor((value.getTime() - value.getTimezoneOffset() * 60 * 1000) / dayMs)
  const delta = startOfDay(date) - startOfDay(now)

  if (delta === 0) return 'сегодня'
  if (delta === 1) return 'завтра'
  if (delta === 2) return 'послезавтра'
  return `через ${delta} ${plural(delta, ['день', 'дня', 'дней'])}`
}

/** Первая буква заглавная — для названий дней недели из Intl */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
