/**
 * Проверка тарифа DeepSeek: пик или дешёвое время.
 *
 * Запуск:
 *   npm run check:price              — текущий момент
 *   npm run check:price -- 2026-10-16T02:30:00Z
 *   npm run check:price -- --week    — раскладка по часам на 7 суток вперёд
 *
 * Скрипт ничего не меняет и никуда не ходит: считает по календарю из lib/pricing.ts.
 */

import {
  CN_HOLIDAYS_2026,
  PRICES,
  describePricing,
  formatWait,
  periodAt,
  pricingStatus,
} from '../lib/pricing.ts'

const args = process.argv.slice(2)

function utcStamp(date: Date): string {
  return `${date.toISOString().replace('T', ' ').slice(0, 16)} UTC`
}

if (args.includes('--week')) {
  const start = new Date()
  // Округляем вниз до начала текущего часа
  start.setUTCMinutes(0, 0, 0)

  console.log('Тариф по часам (UTC) — п = пик (дорого), д = дешёво')
  console.log('')

  const HOUR = 60 * 60 * 1000
  let currentDay = ''

  for (let step = 0; step < 24 * 7; step += 1) {
    const at = new Date(start.getTime() + step * HOUR)
    const dayKey = at.toISOString().slice(0, 10)
    const hour = at.getUTCHours()

    if (dayKey !== currentDay) {
      currentDay = dayKey
      const weekday = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'UTC',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(at)
      process.stdout.write(`\n${weekday.padEnd(14)} `)
    }

    const period = periodAt(at)
    const mark = period === 'peak' ? 'п' : 'д'
    process.stdout.write(hour === 0 ? `[${mark}]` : mark)
  }

  console.log('\n')
  const status = pricingStatus()
  console.log(`Сейчас: ${describePricing(status)}`)
  process.exit(0)
}

const explicit = args.find((value) => !value.startsWith('--'))

let now: Date
if (explicit) {
  now = new Date(explicit)
  if (Number.isNaN(now.getTime())) {
    console.error(`Не понял дату: ${explicit}. Пример: 2026-10-16T02:30:00Z`)
    process.exit(2)
  }
} else {
  now = new Date()
}

const status = pricingStatus(now)
const hour = 60 * 60 * 1000
const day = 24 * hour

console.log(`Момент:  ${utcStamp(now)}`)
console.log(`Статус:  ${describePricing(status, now)}`)
console.log(
  `Значит:  ${status.isExpensive ? 'дорого — по возможности подождать' : 'дёшево — можно работать'}`,
)
console.log(`До смены: ${formatWait(status.msUntilChange)}`)

const waitDays = status.msUntilChange / day
if (status.isExpensive) {
  console.log(`Итого:   ждать ${formatWait(status.msUntilChange)} до дешёвых токенов`)
} else if (waitDays > 3) {
  console.log('Итого:   дешёвое окно длинное — пик будет только в начале следующей недели')
} else {
  console.log(`Итого:   дёшево ещё ${formatWait(status.msUntilChange)}`)
}

if (process.env.PRICE_SHOW_TABLE !== '0') {
  console.log('')
  console.log('Цены за 1M токенов, $ (пик → вне пика):')
  for (const [model, price] of Object.entries(PRICES)) {
    console.log(
      `  ${model.padEnd(16)} вход без кэша ${price.cacheMiss.peak} → ${price.cacheMiss.offPeak}` +
        `, вход из кэша ${price.cacheHit.peak} → ${price.cacheHit.offPeak}` +
        `, выход ${price.output.peak} → ${price.output.offPeak}`,
    )
  }
  console.log(`  праздников Китая в календаре: ${CN_HOLIDAYS_2026.length}`)
}
