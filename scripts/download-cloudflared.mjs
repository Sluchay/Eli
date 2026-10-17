/**
 * Скачивание cloudflared (утилита Cloudflare для туннеля).
 *
 * Запуск: node scripts/download-cloudflared.mjs
 *
 * Зачем отдельный скрипт, а не просто ссылка: 53 МБ надо скачать с прогрессом
 * и проверить, что файл действительно исполняемый, а не страница ошибки.
 */

import { createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'

const URL =
  'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'

const target = path.join(process.cwd(), 'tools', 'cloudflared.exe')
const temp = `${target}.part`

mkdirSync(path.dirname(target), { recursive: true })

if (existsSync(target) && statSync(target).size > 30 * 1024 * 1024) {
  const size = (statSync(target).size / 1024 / 1024).toFixed(1)
  console.log(`cloudflared уже скачан: ${target} (${size} МБ)`)
  process.exit(0)
}

console.log('скачиваю cloudflared…')

const response = await fetch(URL, {
  redirect: 'follow',
  headers: {
    'User-Agent': 'ELI-restaurant-site/0.1',
    Accept: 'application/octet-stream',
  },
})

if (!response.ok || !response.body) {
  console.error(`не удалось скачать: HTTP ${response.status}`)
  process.exit(1)
}

const total = Number(response.headers.get('content-length') ?? 0)
let received = 0
let lastShown = 0

const source = Readable.fromWeb(response.body)

source.on('data', (chunk) => {
  received += chunk.length
  const percent = total ? Math.round((received / total) * 100) : 0
  // Печатаем не чаще, чем каждые 10%
  if (percent >= lastShown + 10) {
    lastShown = percent
    console.log(`  ${percent}% (${(received / 1024 / 1024).toFixed(1)} МБ)`)
  }
})

await pipeline(source, createWriteStream(temp))

// Проверка, что скачался исполняемый файл, а не страница ошибки
const size = statSync(temp).size

if (size < 10 * 1024 * 1024) {
  console.error(`файл подозрительно маленький: ${size} байт — вероятно, это не cloudflared`)
  unlinkSync(temp)
  process.exit(1)
}

const { renameSync } = await import('node:fs')
renameSync(temp, target)

console.log('')
console.log(`готово: ${target} (${(size / 1024 / 1024).toFixed(1)} МБ)`)
