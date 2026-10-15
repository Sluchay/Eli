/**
 * Наполнение базы демонстрационными данными.
 *
 * Это СТАНДАРТНАЯ схема меню для локального ресторана: закуски, салаты, супы,
 * пицца, паста, горячее, гарниры, десерты, напитки, бар. Демо-состав взят по
 * образцу обычного меню локальной пиццерии-ресторана, включая четыре
 * «эталонных» блюда: Цезарь с цыплёнком, Халапеньо 40 см, стейк лосося и
 * феттуччини с грибами и беконом. Всё это заменяется реальным меню ресторана
 * через админку — править код для этого не нужно.
 *
 * Дополнительно в сид намеренно добавлены «неудобные» блюда:
 *  - «Строганина из муксуна» — только название и цена, без фото и описания;
 *  - «Тёплый салат с олениной…» — очень длинное название, состав, шесть
 *    аллергенов и полное КБЖУ;
 *  - «Строганина» стоит в стоп-листе, чтобы было видно, как выглядит блюдо,
 *    которого сейчас нет.
 * Эти три случая ломают вёрстку у 90% сайтов ресторанов. Здесь они должны
 * выглядеть так же аккуратно, как остальные карточки.
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

/** Цены в сиде пишем в рублях — так меню читается человеком. */
const rub = (value: number) => Math.round(value * 100)

const ALLERGENS = {
  gluten: 'Глютен',
  milk: 'Молоко',
  egg: 'Яйцо',
  fish: 'Рыба',
  crustacean: 'Ракообразные',
  mollusc: 'Моллюски',
  nuts: 'Орехи',
  soy: 'Соя',
  celery: 'Сельдерей',
  mustard: 'Горчица',
  sesame: 'Кунжут',
  sulphites: 'Сульфиты',
} as const

type SeedItem = {
  name: string
  description?: string
  price: number
  priceNote?: string
  weight?: string
  volume?: string
  composition?: string
  allergens?: (keyof typeof ALLERGENS)[]
  nutrition?: { kcal: number; protein: number; fat: number; carbs: number }
  badges?: string[]
  isStopList?: boolean
}

type SeedSection = {
  slug: string
  title: string
  description?: string
  iconKey: string
  availableFrom?: string
  availableTo?: string
  items: SeedItem[]
}

const MENU: SeedSection[] = [
  {
    slug: 'zakuski',
    title: 'Закуски',
    description: 'То, с чего начинается вечер: соленья, грибы, хлеб из печи.',
    iconKey: 'starter',
    items: [
      {
        name: 'Сельдь с печёным картофелем и луком',
        description: 'Своей засолки, с красным луком и ароматным маслом.',
        price: 420,
        weight: '180 г',
        badges: ['local'],
        allergens: ['fish'],
        isStopList: true,
      },
      {
        name: 'Грузди со сметаной и луком',
        description: 'Солёные грузди из-под Костромы, густая сметана, зелёный лук.',
        price: 490,
        weight: '150 г',
        badges: ['local', 'hit'],
        allergens: ['milk'],
      },
      {
        name: 'Хлеб печной с маслом на травах',
        description: 'Пшенично-ржаной, на закваске. Подаём тёплым.',
        price: 190,
        weight: '200 г',
        badges: ['vegan'],
        allergens: ['gluten'],
      },
      {
        // Намеренно «пустое» блюдо: только название и цена.
        name: 'Строганина из муксуна',
        price: 890,
      },
    ],
  },
  {
    slug: 'salaty',
    title: 'Салаты',
    description: 'Плотные, не «диетические»: зелень, коренья, грибы, мясо.',
    iconKey: 'salad',
    items: [
      {
        name: 'Цезарь с цыплёнком',
        description:
          'Романо, цыплёнок на гриле, черри, пармезан, гренки из печного хлеба и соус на анчоусах.',
        price: 690,
        weight: '240 г',
        badges: ['hit'],
        allergens: ['gluten', 'milk', 'egg', 'fish'],
        nutrition: { kcal: 430, protein: 26, fat: 27, carbs: 21 },
      },
      {
        name: 'Салат с лисичками и кедровыми орехами',
        description: 'Обжаренные лисички, микс салатов, кедровый орех, масло из зелени.',
        price: 720,
        weight: '210 г',
        badges: ['local', 'new'],
        allergens: ['nuts'],
        nutrition: { kcal: 310, protein: 9, fat: 24, carbs: 14 },
      },
      {
        name: 'Винегрет с копчёной свёклой',
        description: 'Классика в нашей подаче: печёная свёкла, солёный огурец, каперсы.',
        price: 420,
        weight: '230 г',
        badges: ['vegan'],
        allergens: ['mustard'],
        nutrition: { kcal: 190, protein: 4, fat: 9, carbs: 24 },
      },
      {
        // Намеренно «перегруженное» блюдо: длинное название, все поля, 6 аллергенов.
        name: 'Тёплый салат с олениной, кедровыми орехами и брусничным соусом',
        description:
          'Оленина слабой прожарки, тёплые коренья, кедровый орех, брусника и соус демиглас. Подаём на прогретой тарелке — так мясо не остывает, пока вы доедаете салат.',
        price: 890,
        weight: '280 г',
        composition:
          'Оленина, морковь, пастернак, свёкла, кедровый орех, брусника, соус демиглас (телячий бульон, красное вино, сливочное масло, мука), соль, перец.',
        allergens: ['gluten', 'milk', 'nuts', 'celery', 'mustard', 'sulphites'],
        nutrition: { kcal: 520, protein: 34, fat: 33, carbs: 19 },
        badges: ['local', 'new', 'glutenfree'],
      },
    ],
  },
  {
    slug: 'supy',
    title: 'Супы',
    description: 'Варим каждый день, небольшими объёмами.',
    iconKey: 'soup',
    items: [
      {
        name: 'Уха по-северному',
        description: 'Три вида рыбы, прозрачный бульон, укроп и рюмка водки отдельно.',
        price: 590,
        volume: '350 мл',
        weight: '400 г',
        badges: ['hit', 'local'],
        allergens: ['fish', 'celery'],
        nutrition: { kcal: 240, protein: 22, fat: 11, carbs: 12 },
      },
      {
        name: 'Крем-суп из белых грибов',
        description: 'На курином бульоне, со сливками и трюфельным маслом.',
        price: 520,
        volume: '300 мл',
        allergens: ['milk', 'gluten'],
        nutrition: { kcal: 280, protein: 8, fat: 19, carbs: 18 },
      },
      {
        name: 'Щи суточные с говядиной',
        description: 'Настаиваются сутки — отсюда и вкус.',
        price: 480,
        volume: '350 мл',
        badges: ['hit'],
        allergens: ['milk'],
      },
      {
        name: 'Борщ с пампушками',
        description: 'С говядиной, сметаной и чесноком.',
        price: 460,
        volume: '350 мл',
        allergens: ['gluten', 'milk', 'egg'],
      },
    ],
  },
  {
    slug: 'picca',
    title: 'Пицца',
    description: 'Тесто холодного брожения 48 часов, печь на камне.',
    iconKey: 'pizza',
    items: [
      {
        name: 'Халапеньо, 40 см',
        description:
          'Томатный соус, моцарелла, острый халапеньо, салями, красный лук и капля мёда.',
        price: 1190,
        weight: '40 см',
        badges: ['hit', 'spicy'],
        allergens: ['gluten', 'milk'],
        nutrition: { kcal: 1180, protein: 48, fat: 52, carbs: 126 },
      },
      {
        name: 'Маргарита, 30 см',
        description: 'Томаты, моцарелла, базилик. Ничего лишнего.',
        price: 690,
        weight: '30 см',
        badges: ['vegan'],
        allergens: ['gluten', 'milk'],
      },
      {
        name: 'С груздями и трюфельным маслом, 40 см',
        description: 'Солёные грузди, шарлотка, трюфельное масло, тимьян.',
        price: 1290,
        weight: '40 см',
        badges: ['local', 'new'],
        allergens: ['gluten', 'milk'],
      },
    ],
  },
  {
    slug: 'pasta',
    title: 'Паста',
    description: 'Варим аль денте, соусы делаем на месте.',
    iconKey: 'pasta',
    items: [
      {
        name: 'Феттуччини с грибами и беконом',
        description:
          'Сливочный соус, шампиньоны и белые грибы, подкопчённый бекон, пармезан и чёрный перец.',
        price: 790,
        weight: '320 г',
        badges: ['hit'],
        allergens: ['gluten', 'milk', 'egg', 'celery'],
        nutrition: { kcal: 610, protein: 27, fat: 34, carbs: 52 },
      },
      {
        name: 'Паста с креветками и чили',
        description: 'Лингвини, тигровые креветки, чеснок, чили, петрушка, оливковое масло.',
        price: 890,
        weight: '300 г',
        badges: ['spicy'],
        allergens: ['gluten', 'crustacean', 'mollusc'],
        nutrition: { kcal: 520, protein: 30, fat: 18, carbs: 58 },
      },
      {
        name: 'Тальятелле с олениной',
        description: 'Медленное тушение в красном вине, розмарин, пармезан.',
        price: 940,
        weight: '330 г',
        badges: ['local'],
        allergens: ['gluten', 'milk', 'celery', 'sulphites'],
      },
    ],
  },
  {
    slug: 'goryachee',
    title: 'Горячее',
    description: 'Печь, гриль и сковорода. Основная часть меню.',
    iconKey: 'hot',
    items: [
      {
        name: 'Стейк лосося',
        description:
          'Филе на коже, обжаренное до хрустящей корочки, с овощами на гриле и соусом из щавеля.',
        price: 1590,
        weight: '260 г',
        badges: ['hit', 'glutenfree'],
        allergens: ['fish', 'milk'],
        nutrition: { kcal: 480, protein: 41, fat: 29, carbs: 9 },
      },
      {
        name: 'Оленина на гриле с брусничным соусом',
        description: 'Вырезка слабой прожарки, брусника, тимьян, печёный лук-шалот.',
        price: 1790,
        weight: '300 г',
        badges: ['local', 'glutenfree'],
        allergens: ['celery', 'sulphites'],
        nutrition: { kcal: 440, protein: 46, fat: 22, carbs: 11 },
      },
      {
        name: 'Утка с печёным яблоком',
        description: 'Ножка конфи, яблоко с антоновкой, соус из клюквы.',
        price: 1490,
        weight: '320 г',
        allergens: ['sulphites', 'milk'],
      },
      {
        name: 'Котлета по-киевски',
        description: 'С топлёным маслом и зеленью, картофельное пюре, куриный соус.',
        price: 890,
        weight: '290 г',
        allergens: ['gluten', 'milk', 'egg'],
        nutrition: { kcal: 720, protein: 38, fat: 44, carbs: 38 },
      },
      {
        name: 'Пельмени с дичью',
        description: 'Лепим сами: лось, кабан, бульон, сметана, чёрный перец.',
        price: 720,
        weight: '250 г',
        badges: ['local', 'hit'],
        allergens: ['gluten', 'egg', 'milk'],
      },
    ],
  },
  {
    slug: 'garniry',
    title: 'Гарниры',
    description: 'Можно взять отдельно к любому горячему.',
    iconKey: 'side',
    items: [
      {
        name: 'Печёный картофель с розмарином',
        description: 'С морской солью и чесноком.',
        price: 320,
        weight: '220 г',
        badges: ['vegan', 'glutenfree'],
      },
      {
        name: 'Гречка с грибами',
        description: 'На топлёном масле, с луком.',
        price: 290,
        weight: '200 г',
        badges: ['vegan'],
        allergens: ['milk'],
      },
      {
        name: 'Овощи на гриле',
        description: 'Кабачок, баклажан, перец, черри, оливковое масло.',
        price: 390,
        weight: '240 г',
        badges: ['vegan', 'glutenfree'],
      },
    ],
  },
  {
    slug: 'deserty',
    title: 'Десерты',
    description: 'Готовим небольшими партиями, к вечеру разбирают.',
    iconKey: 'dessert',
    items: [
      {
        name: 'Медовик',
        description: 'Восемь коржей, крем на сметане. Наш самый заказываемый десерт.',
        price: 390,
        weight: '150 г',
        badges: ['hit'],
        allergens: ['gluten', 'milk', 'egg'],
        nutrition: { kcal: 460, protein: 7, fat: 26, carbs: 48 },
      },
      {
        name: 'Сырники с облепихой',
        description: 'Со сметаной и облепиховым соусом.',
        price: 420,
        weight: '180 г',
        allergens: ['gluten', 'milk', 'egg'],
      },
      {
        name: 'Мороженое на кедровых орехах',
        description: 'Пломбир, кедровый орех, солёная карамель.',
        price: 350,
        weight: '140 г',
        badges: ['new'],
        allergens: ['milk', 'nuts'],
      },
    ],
  },
  {
    slug: 'napitki',
    title: 'Напитки',
    description: 'Безалкогольные. Свои морсы и травяные чаи.',
    iconKey: 'drink',
    items: [
      {
        name: 'Морс клюквенный',
        description: 'Варим сами, без концентрата.',
        price: 250,
        volume: '0,4 л',
        badges: ['vegan', 'local'],
      },
      { name: 'Иван-чай', description: 'С чабрецом и мёдом.', price: 290, volume: '0,6 л', badges: ['vegan'] },
      { name: 'Компот из лесных ягод', price: 260, volume: '0,4 л', badges: ['vegan'] },
      { name: 'Кофе', description: 'Эспрессо, американо, капучино.', price: 220 },
    ],
  },
  {
    slug: 'bar',
    title: 'Бар',
    description: 'Настойки собственного дела и короткая винная карта.',
    iconKey: 'bar',
    items: [
      {
        name: 'Настойка на кедровых орехах',
        description: 'Своя, 40°. Подаём охлаждённой.',
        price: 350,
        volume: '50 мл',
        badges: ['local'],
      },
      { name: 'Настойка клюквенная', description: 'Своя, 38°.', price: 320, volume: '50 мл', badges: ['local'] },
      { name: 'Крафтовое пиво', description: 'Четыре позиции на кранах.', price: 450, volume: '0,5 л', allergens: ['gluten'] },
      {
        name: 'Глинтвейн хвойный',
        description: 'Красное вино, еловая шишка, апельсин, мёд. Сезонно.',
        price: 480,
        volume: '250 мл',
        badges: ['new'],
        allergens: ['sulphites'],
      },
    ],
  },
]

async function main() {
  console.log('Чистим таблицы…')
  await prisma.menuItemImage.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuSection.deleteMany()
  await prisma.openingHours.deleteMany()
  await prisma.event.deleteMany()
  await prisma.scanEvent.deleteMany()
  await prisma.table.deleteMany()
  await prisma.businessLunch.deleteMany()

  console.log('Настройки сайта…')
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'ЕЛИ',
      tagline: 'Ели. И здесь ель.',
      aboutShort:
        'Небольшой ресторан русской кухни в хвойном лесу. Пихтовый зал, открытая кухня, живая музыка по вечерам.',
      addressFull: 'г. Москва, ул. Лесная, 12',
      city: 'Москва',
      mapLat: 55.7558,
      mapLng: 37.6173,
      routeUrl: 'https://yandex.ru/maps/?rtext=~55.7558,37.6173&rtt=auto',
      phoneDisplay: '+7 (926) 524-01-01',
      phoneHref: 'tel:+79265240101',
      email: 'hello@eli-restaurant.ru',
      lunchNote: 'понедельник – пятница, 12:00–16:00. В праздники не подаём.',
      lunchEnabled: true,
      socials: JSON.stringify([
        { label: 'Telegram', href: 'https://t.me/' },
        { label: 'ВКонтакте', href: 'https://vk.com/' },
      ]),
    },
  })

  console.log('Часы работы…')
  const hours = [
    { weekday: 0, label: 'Понедельник', opensAt: '12:00', closesAt: '23:00', note: null },
    { weekday: 1, label: 'Вторник', opensAt: '12:00', closesAt: '23:00', note: null },
    { weekday: 2, label: 'Среда', opensAt: '12:00', closesAt: '23:00', note: null },
    { weekday: 3, label: 'Четверг', opensAt: '12:00', closesAt: '23:00', note: null },
    { weekday: 4, label: 'Пятница', opensAt: '12:00', closesAt: '01:00', note: 'кухня до 23:30' },
    { weekday: 5, label: 'Суббота', opensAt: '12:00', closesAt: '01:00', note: 'кухня до 23:30' },
    { weekday: 6, label: 'Воскресенье', opensAt: '12:00', closesAt: '22:00', note: null },
  ]
  for (const [index, day] of hours.entries()) {
    await prisma.openingHours.create({ data: { ...day, sortOrder: index * 10 } })
  }

  console.log('Меню…')
  for (const [sectionIndex, section] of MENU.entries()) {
    const created = await prisma.menuSection.create({
      data: {
        slug: section.slug,
        title: section.title,
        description: section.description ?? null,
        iconKey: section.iconKey,
        sortOrder: sectionIndex * 10,
        availableFrom: section.availableFrom ?? null,
        availableTo: section.availableTo ?? null,
      },
    })

    for (const [itemIndex, item] of section.items.entries()) {
      await prisma.menuItem.create({
        data: {
          sectionId: created.id,
          name: item.name,
          description: item.description ?? null,
          price: rub(item.price),
          priceNote: item.priceNote ?? null,
          weight: item.weight ?? null,
          volume: item.volume ?? null,
          composition: item.composition ?? null,
          allergens: JSON.stringify(item.allergens ?? []),
          calories: item.nutrition?.kcal ?? null,
          protein: item.nutrition?.protein ?? null,
          fat: item.nutrition?.fat ?? null,
          carbs: item.nutrition?.carbs ?? null,
          badges: JSON.stringify(item.badges ?? []),
          isStopList: item.isStopList ?? false,
          sortOrder: itemIndex * 10,
        },
      })
    }

    console.log(`  ${section.title}: ${section.items.length} поз.`)
  }

  console.log('Афиша…')
  const now = new Date()
  const nextFriday = new Date(now)
  nextFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7))
  nextFriday.setHours(20, 0, 0, 0)

  await prisma.event.create({
    data: {
      slug: 'vecher-zhivoy-muzyki',
      title: 'Вечер живой музыки',
      description:
        'Квартет играет джаз и русские песни, начиная с восьми вечера. Столы на этот вечер лучше бронировать заранее — зал заполняется полностью.',
      startsAt: nextFriday,
      priceNote: 'депозит 1500 ₽ на гостя',
      bookingPhone: '+7 (926) 524-01-01',
      isFeatured: true,
    },
  })

  // Второй формат афиши — «пост»: фото и подпись, без даты и заголовка.
  // Именно так удобнее всего переносить анонсы из соцсетей.
  await prisma.event.create({
    data: {
      description:
        'Конец декабря: зал украшен, по вечерам играет живая музыка, в меню появляется глинтвейн на еловых шишках. Столы на праздники бронируйте заранее — свободных почти не остаётся.',
      priceNote: 'вход свободный',
      isPublished: true,
      sortOrder: 100,
    },
  })

  console.log('Бизнес-ланч…')
  const lunches: {
    title: string
    description: string
    price: number
    priceNote?: string
    sortOrder: number
  }[] = [
    {
      title: 'Ланч: суп, горячее и напиток',
      description:
        'Суп дня, горячее с гарниром и морс. Состав меняется каждый день — спрашивайте у официанта или смотрите на доске у входа.',
      price: rub(490),
      sortOrder: 0,
    },
    {
      title: 'Большой ланч: салат, суп, горячее и десерт',
      description:
        'Четыре перемены для тех, кто обедает не спеша. Действует по будням, кроме праздников.',
      price: rub(690),
      priceNote: 'по будням до 16:00',
      sortOrder: 10,
    },
  ]

  for (const lunch of lunches) {
    await prisma.businessLunch.create({ data: lunch })
  }

  console.log('Столы и QR…')
  for (let number = 1; number <= 12; number += 1) {
    await prisma.table.create({
      data: {
        number,
        label: number <= 4 ? 'у окна' : number >= 10 ? 'веранда' : null,
        qrToken: `t${number}-${Math.random().toString(36).slice(2, 10)}`,
      },
    })
  }

  console.log('Администратор…')
  const email = process.env.ADMIN_EMAIL ?? 'admin@eli.local'
  const password = process.env.ADMIN_INITIAL_PASSWORD ?? 'eli-admin-2024'
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Администратор',
      role: 'ADMIN',
      passwordHash: hashPassword(password),
    },
  })

  const totals = await prisma.menuItem.count()
  console.log(`\nГотово. Разделов: ${MENU.length}, блюд: ${totals}.`)
  console.log(`Вход в админку: ${email} / ${password} (сменить после первого входа)`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
