/**
 * Временный источник данных для публичной части.
 *
 * ЭТАП 2 переносит всё это в базу (таблицы SiteSettings и OpeningHours),
 * чтобы владелец правил данные из админки. До того момента значения живут здесь.
 *
 * Всё, что помечено в CONTENT-TODO.md, нужно заменить реальными данными ресторана.
 */

/**
 * Адрес по частям: из них собираются и полная строка, и короткая, и две
 * строки для карточки «Как добраться». Держать три копии адреса в трёх
 * местах — верный способ развести их при первой же правке.
 */
const ADDRESS = {
  city: 'Егорьевск',
  street: 'ул. Советская, 157',
  place: 'ТЦ «Форум», 3 этаж',
} as const

// Поисковый запрос для карт. Точных координат у нас нет, а выдуманные хуже
// отсутствующих: по координатам гость приедет не туда и не поймёт почему.
// Поэтому обе ссылки — поиск по адресу: карта сама находит здание, а маршрут
// строится одной кнопкой уже на ней.
const MAP_QUERY = encodeURIComponent(
  `${ADDRESS.city}, ${ADDRESS.street}, ${ADDRESS.place}`,
)

export const SITE = {
  name: 'ЕЛИ',
  tagline: 'Ели. И здесь ель.',
  descriptionShort:
    'Небольшой ресторан русской кухни в хвойном лесу. Пихтовый зал, открытая кухня, живая музыка по вечерам.',
  /** Телефон с афиши ресторана — подтвердить у владельца */
  phoneDisplay: '+7 (926) 524-01-01',
  phoneHref: 'tel:+79265240101',
  email: 'hello@eli-restaurant.ru',
  addressFull: `г. ${ADDRESS.city}, ${ADDRESS.street}, ${ADDRESS.place}`,
  addressShort: ADDRESS.street,
  /** Полный адрес в две строки — для карточки «Как добраться» */
  addressLines: [`г. ${ADDRESS.city}, ${ADDRESS.street}`, ADDRESS.place],
  city: ADDRESS.city,
  /** Подпись под адресом в контактах */
  contactNote: 'За подробной информацией обращаться по телефону:',
  /** Ссылка на маршрут: без API-ключей и без внешних скриптов */
  routeUrl: `https://yandex.ru/maps/?text=${MAP_QUERY}`,
  mapUrl: `https://yandex.ru/maps/?text=${MAP_QUERY}&z=17`,
  socials: [
    { label: 'Telegram', href: 'https://t.me/' },
    { label: 'ВКонтакте', href: 'https://vk.com/' },
  ],
} as const

export type DayHours = {
  /** 0 = понедельник ... 6 = воскресенье */
  weekday: number
  label: string
  opensAt: string | null
  closesAt: string | null
  note?: string
}

export const OPENING_HOURS: readonly DayHours[] = [
  { weekday: 0, label: 'Понедельник', opensAt: '12:00', closesAt: '23:00' },
  { weekday: 1, label: 'Вторник', opensAt: '12:00', closesAt: '23:00' },
  { weekday: 2, label: 'Среда', opensAt: '12:00', closesAt: '23:00' },
  { weekday: 3, label: 'Четверг', opensAt: '12:00', closesAt: '23:00' },
  { weekday: 4, label: 'Пятница', opensAt: '12:00', closesAt: '01:00', note: 'кухня до 23:30' },
  { weekday: 5, label: 'Суббота', opensAt: '12:00', closesAt: '01:00', note: 'кухня до 23:30' },
  { weekday: 6, label: 'Воскресенье', opensAt: '12:00', closesAt: '22:00' },
]
