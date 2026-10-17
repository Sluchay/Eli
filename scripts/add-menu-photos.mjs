/**
 * Добавить присланные фото в меню.
 *
 * Запуск: node scripts/add-menu-photos.mjs
 *
 * Что делает с каждым файлом:
 *  1. читает картинку в любом формате (jpg, png, webp, jfif…);
 *  2. сжимает и переводит в WebP — как это делает загрузка через админку,
 *     чтобы на телефоне меню не весило десятки мегабайт;
 *  3. сохраняет в data/uploads/<год-месяц>/ под случайным именем
 *     (так же, как админка, чтобы не было коллизий);
 *  4. привязывает к блюду по названию файла.
 *
 * Соответствие «имя файла → блюдо» — в списке PHOTOS ниже:
 * имя файла без расширения должно совпадать с названием блюда в базе.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import sharp from 'sharp'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SOURCE_DIR = path.join(process.cwd(), 'data', 'uploads', '2026-10')
const TARGET_DIR = path.join(process.cwd(), 'data', 'uploads', '2026-11')

/**
 * Фото к добавлению.
 *
 * crop — срезать часть картинки перед сохранением. У хлеба внизу кадра
 * был логотип «Meta AI»: на сайте ресторана чужой водяной знак не нужен,
 * поэтому срезаем нижнюю полосу. Остальные фото идут целиком.
 */
const PHOTOS = [
  { file: 'Маргарита.jpg' },
  { file: 'Халапеньо.webp' },
  { file: 'С груздями и трюфельным маслом.png' },
  { file: 'Цезарь с цыплёнком.webp' },
  { file: 'Грузди со сметаной и луком.webp' },
  { file: 'Строганина из муксуна.jfif' },
  { file: 'Хлеб печной с маслом на травах.jpg', cropBottom: 140 },
]

const MAX_WIDTH = 1600
const WEBP_QUALITY = 82

await mkdir(TARGET_DIR, { recursive: true })

let added = 0
let skipped = 0

for (const photo of PHOTOS) {
  const dishName = path.parse(photo.file).name

  const dish = await prisma.menuItem.findFirst({
    where: { name: dishName },
    include: { images: true },
  })

  if (!dish) {
    console.log(`— ${photo.file}: блюдо «${dishName}» не найдено в базе, пропускаю`)
    skipped += 1
    continue
  }

  const sourcePath = path.join(SOURCE_DIR, photo.file)
  const buffer = await readFile(sourcePath)

  let pipeline = sharp(buffer).rotate()

  if (photo.cropBottom) {
    const meta = await sharp(buffer).metadata()
    const height = (meta.height ?? 0) - photo.cropBottom
    pipeline = pipeline.extract({
      left: 0,
      top: 0,
      width: meta.width ?? 0,
      height,
    })
  }

  const processed = await pipeline
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  const fileName = `${randomBytes(8).toString('hex')}.webp`
  await writeFile(path.join(TARGET_DIR, fileName), processed)

  const meta = await sharp(processed).metadata()

  // Одно фото на блюдо: старое (если было) убираем
  await prisma.menuItemImage.deleteMany({ where: { itemId: dish.id } })

  await prisma.menuItemImage.create({
    data: {
      itemId: dish.id,
      path: `/uploads/2026-11/${fileName}`,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      isPrimary: true,
      alt: dish.name,
    },
  })

  console.log(
    `✓ ${dishTitle(dish.name)} ← ${photo.file}\n` +
      `   ${meta.width}x${meta.height}, ${(processed.length / 1024).toFixed(0)} КБ` +
      (photo.cropBottom ? ' (нижняя полоса срезана)' : ''),
  )
  added += 1
}

function dishTitle(name) {
  return `«${name}»`
}

console.log('')
console.log(`добавлено: ${added}, пропущено: ${skipped}`)

const total = await prisma.menuItemImage.count()
const without = await prisma.menuItem.count({ where: { images: { none: {} } } })
console.log(`фото в меню всего: ${total}, блюд без фото: ${without}`)

await prisma.$disconnect()
