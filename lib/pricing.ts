/**
 * Когда DeepSeek считает токены дешевле.
 *
 * У DeepSeek две цены на одни и те же модели: обычная («пик») и ровно в два
 * раза дешевле («вне пика»). Пиковые часы заданы в UTC и только по будням:
 * 01:00–04:00 и 06:00–10:00 UTC, с понедельника по пятницу. Всё остальное
 * время — выходные, ночи, вечера и праздники Китая — считается по дешёвому
 * тарифу. Источник: https://api-docs.deepseek.com/quick_start/pricing
 *
 * Модуль намеренно не знает ничего про сайт и не ходит в сеть: это чистая
 * функция от даты. Поэтому его можно звать откуда угодно — из скрипта,
 * из админки, из теста.
 */

/** Пиковые окна в UTC: [начало, конец) в часах. */
export const PEAK_WINDOWS_UTC: readonly (readonly [number, number])[] = [
  [1, 4],
  [6, 10],
]

/**
 * Праздники Китая на 2026 год (время UTC+8), когда пикового тарифа нет.
 *
 * Список конечный по своей природе: Госсовет Китая публикует календарь
 * выходных на год вперёд, обычно в ноябре–декабре. Поэтому его нужно
 * дополнять раз в год — иначе цены в эти дни будут показаны как пиковые,
 * то есть дороже, чем на самом деле. Ошибка безопасная: вы просто отложите
 * работу, хотя могли бы работать дешевле.
 *
 * Реальные выходные длиннее этих дат (переносы рабочих суббот и воскресений),
 * и точный календарь стоит сверять с официальным уведомлением Госсовета КНР.
 */
export const CN_HOLIDAYS_2026: readonly string[] = [
  // Новый год
  '2026-01-01',
  // Весенний фестиваль (китайский Новый год)
  '2026-02-16',
  '2026-02-17',
  '2026-02-18',
  '2026-02-19',
  '2026-02-20',
  // Цинмин
  '2026-04-05',
  '2026-04-06',
  // День труда
  '2026-05-01',
  '2026-05-04',
  '2026-05-05',
  // Праздник драконьих лодок
  '2026-06-19',
  // Праздник середины осени
  '2026-09-25',
  // День образования КНР
  '2026-10-01',
  '2026-10-02',
  '2026-10-05',
  '2026-10-06',
  '2026-10-07',
]

/** Часовой пояс Пекина: по нему живёт календарь праздников. */
const CHINA_OFFSET_MINUTES = 8 * 60

export type PricingPeriod = 'peak' | 'off-peak'

export type PricingStatus = {
  period: PricingPeriod
  /** Цена сейчас вдвое выше обычной дешёвой? */
  isExpensive: boolean
  /** Момент ближайшей смены тарифа. */
  nextChangeAt: Date
  nextPeriod: PricingPeriod
  /** Сколько осталось до смены, в миллисекундах (всегда > 0). */
  msUntilChange: number
  /** Цена сейчас — половина? */
  isDiscounted: boolean
}

/** Часть даты в заданной зоне, посчитанная как «настенные часы» этой зоны. */
function partsInZone(date: Date, offsetMinutes: number) {
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(), // 0 = воскресенье
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * День Пекина в формате ГГГГ-ММ-ДД.
 *
 * Важно: день считается по Пекину, а не по UTC. Вечер 30 сентября по UTC —
 * это уже 1 октября в Пекине, то есть первый день праздников.
 */
export function chinaDateKey(date: Date): string {
  const p = partsInZone(date, CHINA_OFFSET_MINUTES)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`
}

/** Пиковый ли тариф в этот момент. */
export function periodAt(date: Date, holidays: readonly string[] = CN_HOLIDAYS_2026): PricingPeriod {
  const p = partsInZone(date, 0) // пиковые окна заданы в UTC — считаем по UTC

  // Суббота (6) и воскресенье (0) — всегда дешёвый тариф.
  if (p.weekday === 0 || p.weekday === 6) return 'off-peak'

  // Праздники Китая приравнены к выходным.
  if (holidays.includes(chinaDateKey(date))) return 'off-peak'

  for (const [from, to] of PEAK_WINDOWS_UTC) {
    if (p.hour >= from && p.hour < to) return 'peak'
  }

  return 'off-peak'
}

/**
 * Когда тариф сменится в следующий раз.
 *
 * Перебираем часы вперёд: смены бывают только на границах часов, поэтому
 * точность — минута, а не секунда. Горизонт в 40 дней гарантированно
 * накрывает любой праздничный период.
 */
export function nextChange(
  date: Date,
  holidays: readonly string[] = CN_HOLIDAYS_2026,
): { at: Date; period: PricingPeriod } {
  const current = periodAt(date, holidays)
  const HOUR = 60 * 60 * 1000

  for (let step = 1; step <= 24 * 40; step += 1) {
    const candidate = new Date(date.getTime() + step * HOUR)
    const period = periodAt(candidate, holidays)
    if (period !== current) {
      // Смена случилась где-то внутри этого часа — сообщаем начало часа.
      return { at: new Date(candidate.getTime() - HOUR + 1), period }
    }
  }

  // Недостижимо: ближайшие сутки всегда содержат смену тарифа.
  return { at: new Date(date.getTime() + 24 * HOUR), period: current === 'peak' ? 'off-peak' : 'peak' }
}

export function pricingStatus(
  now: Date = new Date(),
  holidays: readonly string[] = CN_HOLIDAYS_2026,
): PricingStatus {
  const period = periodAt(now, holidays)
  const change = nextChange(now, holidays)

  return {
    period,
    isExpensive: period === 'peak',
    nextChangeAt: change.at,
    nextPeriod: change.period,
    msUntilChange: Math.max(0, change.at.getTime() - now.getTime()),
    isDiscounted: period === 'off-peak',
  }
}

/**
 * Дешёвое окно, в которое попадёт ближайшая смена тарифа.
 *
 * Если сейчас пик — это конец ожидания. Если сейчас дешёвый тариф — это
 * начало ближайшего окна, когда снова станет дёшево.
 */
export function formatWait(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days} д`)
  if (hours > 0) parts.push(`${hours} ч`)
  if (days === 0 && minutes > 0) parts.push(`${minutes} мин`)

  return parts.length > 0 ? parts.join(' ') : 'меньше минуты'
}

/** Цены за 1M токенов, $ — как их публикует DeepSeek. */
export const PRICES = {
  'deepseek-flash': {
    cacheHit: { peak: 0.006, offPeak: 0.003 },
    cacheMiss: { peak: 0.3, offPeak: 0.15 },
    output: { peak: 1.2, offPeak: 0.6 },
  },
  'deepseek-v4-pro': {
    cacheHit: { peak: 0.044, offPeak: 0.022 },
    cacheMiss: { peak: 1.32, offPeak: 0.66 },
    output: { peak: 3.96, offPeak: 1.98 },
  },
} as const

export type PriceModel = keyof typeof PRICES

/**
 * Строка для человека: «вне пика — в 2 раза дешевле, ждать 3 ч 12 мин».
 * Ровно то, что нужно в одну строку ответа.
 */
export function describePricing(status: PricingStatus, now: Date = new Date()): string {
  const time = (date: Date) =>
    new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)

  const wait = formatWait(status.msUntilChange)

  if (status.isExpensive) {
    return `сейчас ПИК (дорого, ×2) — дешёвый тариф с ${time(status.nextChangeAt)} UTC, ждать ${wait}`
  }

  const tail =
    status.nextPeriod === 'peak'
      ? `пик начнётся в ${time(status.nextChangeAt)} UTC (через ${wait})`
      : `дешёвый тариф продлится до ${time(status.nextChangeAt)} UTC (ещё ${wait})`

  return `сейчас ВНЕ ПИКА (дешёвые токены, −50%) — ${tail}`
}
