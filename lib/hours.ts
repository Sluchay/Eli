import { OPENING_HOURS, type DayHours } from '@/lib/site'

/**
 * Расчёт «открыто сейчас» и «откроемся …».
 *
 * Всё считается на сервере по часовому поясу ресторана (TZ), а не по времени
 * устройства гостя: гость может сидеть в другом поясе, а ресторан работает
 * по своему. Учитываются окна, уходящие за полночь (пятница до 01:00).
 */

const TIME_ZONE = process.env.TZ ?? 'Europe/Moscow'

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
}

function partsInTimeZone(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  const weekday = WEEKDAY_INDEX[get('weekday')] ?? 0
  const hour = Number.parseInt(get('hour'), 10) % 24
  const minute = Number.parseInt(get('minute'), 10)

  return { weekday, minutes: hour * 60 + minute }
}

function toMinutes(value: string | null): number | null {
  if (!value) return null
  const [h, m] = value.split(':')
  const hours = Number.parseInt(h ?? '', 10)
  const minutes = Number.parseInt(m ?? '', 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

/** Интервал работы дня в минутах от полуночи. Закрытие после полуночи — больше 1440. */
function dayInterval(day: DayHours): { open: number; close: number } | null {
  const open = toMinutes(day.opensAt)
  const close = toMinutes(day.closesAt)
  if (open === null || close === null) return null
  return { open, close: close <= open ? close + 24 * 60 : close }
}

export type OpenStatus = {
  isOpen: boolean
  /** «Открыто до 01:00» или «Закрыто. Откроемся завтра в 12:00» */
  message: string
  /** Короткая строка для шапки: «Открыто» / «Закрыто» */
  short: string
  todayHoursLabel: string
  today: DayHours
}

function humanWeekdayOffset(offset: number): string {
  if (offset === 0) return 'сегодня'
  if (offset === 1) return 'завтра'
  return 'в ближайший рабочий день'
}

export function getOpenStatus(date: Date = new Date()): OpenStatus {
  const { weekday, minutes } = partsInTimeZone(date)
  const today = OPENING_HOURS[weekday] ?? OPENING_HOURS[0]!
  const todayLabel = formatRange(today)

  // Окно сегодняшнего дня
  const current = dayInterval(today)
  if (current && minutes >= current.open && minutes < current.close) {
    return {
      isOpen: true,
      short: 'Открыто',
      message: `Открыто до ${today.closesAt}`,
      todayHoursLabel: todayLabel,
      today,
    }
  }

  // Окно вчерашнего дня, ушедшее за полночь
  const yesterday = OPENING_HOURS[(weekday + 6) % 7]!
  const previous = dayInterval(yesterday)
  if (previous && previous.close > 24 * 60 && minutes + 24 * 60 < previous.close) {
    return {
      isOpen: true,
      short: 'Открыто',
      message: `Открыто до ${yesterday.closesAt}`,
      todayHoursLabel: todayLabel,
      today,
    }
  }

  // Закрыто: ищем ближайшее открытие, начиная с сегодняшнего дня
  if (current && minutes < current.open) {
    return {
      isOpen: false,
      short: 'Закрыто',
      message: `Закрыто. Откроемся сегодня в ${today.opensAt}`,
      todayHoursLabel: todayLabel,
      today,
    }
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const day = OPENING_HOURS[(weekday + offset) % 7]!
    const interval = dayInterval(day)
    if (interval) {
      return {
        isOpen: false,
        short: 'Закрыто',
        message: `Закрыто. Откроемся ${humanWeekdayOffset(offset)} в ${day.opensAt}`,
        todayHoursLabel: todayLabel,
        today,
      }
    }
  }

  return {
    isOpen: false,
    short: 'Закрыто',
    message: 'Расписание уточняется',
    todayHoursLabel: todayLabel,
    today,
  }
}

export function formatRange(day: DayHours): string {
  if (!day.opensAt || !day.closesAt) return 'выходной'
  return `${day.opensAt}–${day.closesAt}`
}

export function getOpeningHours(): readonly DayHours[] {
  return OPENING_HOURS
}
