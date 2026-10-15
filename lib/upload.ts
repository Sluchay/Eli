import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

/**
 * Приём и подготовка изображений.
 *
 * Фотографии сжимаются и конвертируются в WebP прямо при загрузке. Это важнее,
 * чем кажется: снимок с телефона весит 4–6 МБ, и если положить его на страницу
 * как есть, меню на мобильном интернете станет невыносимым. После обработки
 * та же фотография весит 80–200 КБ и выглядит так же.
 *
 * Поэтому на выдаче используется обычный <img>, а не оптимизатор Next:
 * оптимизировать уже оптимизированное незачем.
 */

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024 // 12 МБ

const MAX_WIDTH = 1600
const WEBP_QUALITY = 82

export function uploadRoot(): string {
  // Путь приходит из переменной окружения и сборщику заранее неизвестен.
  // Пометка turbopackIgnore говорит Next не пытаться включить в сборку
  // весь проект целиком из-за этого динамического обращения к файлам.
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR ?? './data/uploads')
}

export type SavedImage = {
  path: string
  width: number
  height: number
}

export async function saveImage(buffer: Buffer, maxWidth = MAX_WIDTH): Promise<SavedImage> {
  const now = new Date()
  const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const directory = path.join(uploadRoot(), folder)
  await mkdir(directory, { recursive: true })

  // rotate() без аргументов применяет ориентацию из EXIF — иначе фото с
  // телефона окажется повёрнутым на бок.
  const processed = await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  const fileName = `${randomBytes(8).toString('hex')}.webp`
  await writeFile(path.join(directory, fileName), processed)

  const meta = await sharp(processed).metadata()

  return {
    path: `/uploads/${folder}/${fileName}`,
    width: meta.width ?? maxWidth,
    height: meta.height ?? 0,
  }
}
