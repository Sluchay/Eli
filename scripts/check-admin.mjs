/**
 * Проверка админки: защита, вход, доступ к разделам.
 *
 * Запуск: сервер уже поднят, затем
 *   node scripts/check-admin.mjs [базовый-адрес]
 *
 * Скрипт проходит ровно тот путь, который проходит владелец: стучится в админку
 * без входа, получает форму, отправляет её как обычный браузер без JavaScript
 * (Next поддерживает такую отправку форм), забирает куку сессии и открывает
 * разделы. Так проверяется вся цепочка, а не только отрисовка страниц.
 */

const base = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/$/, '')
const email = process.env.ADMIN_EMAIL ?? 'admin@eli.local'
const password = process.env.ADMIN_INITIAL_PASSWORD ?? 'eli-admin-2024'

let failures = 0

function report(ok, message) {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${message}`)
}

/* 1. Без входа админка недоступна */
const guard = await fetch(`${base}/admin/menu`, { redirect: 'manual' })
const guardLocation = guard.headers.get('location') ?? ''
report(
  guard.status >= 300 && guard.status < 400 && guardLocation.includes('/admin/login'),
  `без входа /admin/menu уводит на вход (код ${guard.status})`,
)

/* 2. Форма входа отдаётся и содержит поле серверного действия */
const loginPage = await fetch(`${base}/admin/login`)
const loginHtml = await loginPage.text()
report(loginPage.ok && loginHtml.includes('Вход в админку'), 'страница входа открывается')

const actionField = loginHtml.match(/name="(\$ACTION_ID_[^"]+)"/)?.[1]
report(Boolean(actionField), 'форма входа готова к отправке без JavaScript')

if (!actionField) {
  console.log('\nДальше идти нельзя: не нашёл поле действия в форме.')
  process.exit(1)
}

/* 3. Вход */
// Форма объявлена как multipart/form-data — именно так её отправляет браузер
// без JavaScript. С urlencoded Next не распознаёт серверное действие.
const body = new FormData()
body.set(actionField, '')
body.set('email', email)
body.set('password', password)

const loginResponse = await fetch(`${base}/admin/login`, {
  method: 'POST',
  headers: { Origin: base },
  body,
  redirect: 'manual',
})

const setCookie = loginResponse.headers.getSetCookie?.() ?? []
const sessionCookie = setCookie.find((value) => value.startsWith('eli_admin='))

report(
  loginResponse.status >= 300 && loginResponse.status < 400,
  `вход принят и перенаправляет (код ${loginResponse.status})`,
)
report(Boolean(sessionCookie), 'выдана cookie сессии')

if (!sessionCookie) {
  console.log('\nДальше идти нельзя: сессия не выдана.')
  process.exit(1)
}

const cookieHeader = sessionCookie.split(';')[0]

/* 4. Разделы админки с сессией */
const sections = [
  { path: '/admin', must: ['Сводка'] },
  { path: '/admin/menu', must: ['Меню', 'Салаты', 'Нет в наличии'] },
  { path: '/admin/stop-list', must: ['Стоп-лист', 'Цезарь'] },
  { path: '/admin/lunch', must: ['Бизнес-ланч', 'Когда подаём'] },
  { path: '/admin/events', must: ['Афиша', 'События с датой', 'Анонсы без даты'] },
  { path: '/admin/items/new', must: ['Новое блюдо', 'Так увидит гость'] },
]

for (const section of sections) {
  const response = await fetch(`${base}${section.path}`, { headers: { cookie: cookieHeader } })
  const html = await response.text()
  const missing = section.must.filter((needle) => !html.includes(needle))
  report(response.ok && missing.length === 0, `${section.path}${missing.length ? ` — нет: ${missing.join(', ')}` : ''}`)
}

/* 5. Неверный пароль не пускает */
const wrongBody = new FormData()
wrongBody.set(actionField, '')
wrongBody.set('email', email)
wrongBody.set('password', 'неверный-пароль')

const wrongResponse = await fetch(`${base}/admin/login`, {
  method: 'POST',
  headers: { Origin: base },
  body: wrongBody,
  redirect: 'manual',
})

const wrongCookie = (wrongResponse.headers.getSetCookie?.() ?? []).find((value) =>
  value.startsWith('eli_admin='),
)
report(!wrongCookie, 'неверный пароль не выдаёт сессию')

console.log(failures === 0 ? '\nАдминка работает.' : `\nПровалено проверок: ${failures}`)
process.exit(failures === 0 ? 0 : 1)
