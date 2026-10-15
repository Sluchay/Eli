/**
 * Дымовой тест публичных страниц.
 *
 * Запуск: сервер уже поднят (`pnpm start` или `pnpm dev`), затем
 *   node scripts/smoke-test.mjs [базовый-адрес]
 *
 * Проверяет не только код ответа, но и то, что на странице действительно есть
 * ожидаемый текст: пустая страница с кодом 200 — самая частая «успешная» поломка.
 */

const base = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/$/, '')

const EXPECTED = [
  {
    path: '/',
    must: ['ЕЛИ', 'Ели. И здесь ель.', 'Смотреть меню', 'Атмосфера', 'Часы работы', 'Контакты'],
  },
  {
    path: '/menu',
    must: [
      'Что у нас едят',
      'Закуски',
      'Салаты',
      'Супы',
      'Пицца',
      'Паста',
      'Горячее',
      'Десерты',
      'Бар',
      'Цезарь с цыплёнком',
      'Халапеньо',
      'Стейк лосося',
      'Феттуччини с грибами и беконом',
      'Нет в наличии',
      'Тёплый салат с олениной',
      'Строганина из муксуна',
    ],
  },
  {
    path: '/menu?t=5',
    must: ['Стол №5', 'Что у нас едят'],
  },
  {
    path: '/events',
    must: ['Афиша', 'Вечер живой музыки', 'Анонсы', 'Забронировать'],
  },
  {
    path: '/lunch',
    must: ['Бизнес-ланч', 'Обед по-будничному', 'Ланч: суп, горячее и напиток'],
  },
  {
    path: '/booking',
    must: ['Забронировать стол', '926', 'Часы'],
  },
  {
    path: '/privacy',
    must: ['Политика конфиденциальности', 'персональных данных'],
  },
]

async function waitForServer() {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const response = await fetch(`${base}/`, { redirect: 'manual' })
      if (response.status < 500) return true
    } catch {
      // сервер ещё поднимается
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return false
}

const ready = await waitForServer()
if (!ready) {
  console.error(`Сервер на ${base} не ответил за 60 секунд`)
  process.exit(1)
}

let failures = 0

for (const check of EXPECTED) {
  const response = await fetch(`${base}${check.path}`)
  const html = await response.text()
  const missing = check.must.filter((needle) => !html.includes(needle))

  const ok = response.ok && missing.length === 0
  if (!ok) failures += 1

  const size = `${Math.round(html.length / 1024)} КБ`
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${check.path} — ${response.status}, ${size}` +
      (missing.length > 0 ? `\n       нет на странице: ${missing.join(', ')}` : ''),
  )
}

console.log(failures === 0 ? '\nВсе страницы в порядке.' : `\nПровалено проверок: ${failures}`)
process.exit(failures === 0 ? 0 : 1)
