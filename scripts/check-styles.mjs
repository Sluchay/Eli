/**
 * Проверка, что дизайн-система действительно доехала до браузера.
 *
 * Запуск: сервер уже поднят, затем
 *   node scripts/check-styles.mjs [базовый-адрес]
 *
 * Смысл проверки: страница может отдавать 200 и содержать все тексты, но
 * остаться без стилей — например, если Tailwind не собрался или шрифты не
 * подключились. Тогда сайт выглядит как документ из 1998 года, и ни один
 * тест на текст этого не заметит.
 */

const base = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/$/, '')

const REQUIRED_TOKENS = [
  '--color-forest-700',
  '--color-kraft-100',
  '--color-brass',
  '--font-heading',
  'Old Standard TT',
  'Golos Text',
]

const REQUIRED_CLASSES = ['bg-forest-900', 'text-kraft-100', 'font-heading']

const html = await (await fetch(`${base}/menu`)).text()

const cssHref = html.match(/href="([^"]+\.css)"/)?.[1]
if (!cssHref) {
  console.error('Не нашёл ссылку на CSS в HTML страницы меню')
  process.exit(1)
}

const cssUrl = cssHref.startsWith('http') ? cssHref : `${base}${cssHref}`
const css = await (await fetch(cssUrl)).text()

const missingTokens = REQUIRED_TOKENS.filter((token) => !css.includes(token))
const missingClasses = REQUIRED_CLASSES.filter((name) => !css.includes(name))

console.log(`CSS: ${cssUrl}`)
console.log(`Размер стилей: ${Math.round(css.length / 1024)} КБ`)
console.log(`Токены бренда: ${missingTokens.length === 0 ? 'все на месте' : `нет — ${missingTokens.join(', ')}`}`)
console.log(`Утилиты Tailwind: ${missingClasses.length === 0 ? 'на месте' : `нет — ${missingClasses.join(', ')}`}`)

if (missingTokens.length > 0 || missingClasses.length > 0) {
  process.exit(1)
}

console.log('\nДизайн-система на месте: цвета, шрифты и утилиты собраны.')
