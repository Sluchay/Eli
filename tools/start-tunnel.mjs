/**
 * Запуск сайта и публичной ссылки через Cloudflare Tunnel.
 *
 * Использование:
 *   start.cmd tunnel
 *
 * Что делает:
 *  1. проверяет, что cloudflared скачан (если нет — скачивает);
 *  2. поднимает сайт на порту 3000, если он ещё не запущен;
 *  3. поднимает туннель, печатает ссылку и САМА ПРОВЕРЯЕТ, что она открывается;
 *  4. если один протокол не работает — пробует следующий.
 *
 * Почему с проверкой и перебором протоколов: у быстрых туннелей Cloudflare
 * два транспорта — QUIC (UDP) и HTTP/2 (TCP). В сетях, где UDP режут или
 * где провайдер вмешивается в длинные соединения, один из них работает,
 * а другой отваливается. Раньше скрипт жёстко брал HTTP/2 и падал на сетях,
 * где он не проходит. Теперь выбор делает сама программа.
 *
 * Ссылка живёт, пока открыто это окно. Адрес при каждом запуске новый.
 */

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const cloudflared = path.join(root, 'tools', 'cloudflared.exe')
const PORT = 3000

/**
 * Порядок протоколов.
 *  - quic: быстрее и обычно стабильнее, но требует UDP — в части сетей закрыт;
 *  - http2: работает через обычный TCP, чаще проходит там, где UDP режут;
 *  - auto: пусть cloudflared сам выберет, если первые два не дали ссылки.
 */
const PROTOCOLS = ['http2', 'quic', 'auto']

/* ── 1. cloudflared на месте? ─────────────────────────────────────────────── */

if (!existsSync(cloudflared) || statSync(cloudflared).size < 10 * 1024 * 1024) {
  console.log('cloudflared не найден — скачиваю (около 53 МБ)…')
  const download = spawnSync(process.execPath, ['scripts/download-cloudflared.mjs'], {
    stdio: 'inherit',
    cwd: root,
  })

  if (download.status !== 0) {
    console.error('Не удалось скачать cloudflared')
    process.exit(1)
  }
}

/* ── 2. сайт уже работает? ───────────────────────────────────────────────── */

async function siteIsUp() {
  try {
    const response = await fetch(`http://127.0.0.1:${PORT}/`, {
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

if (await siteIsUp()) {
  console.log(`Сайт уже работает на порту ${PORT}`)
} else {
  console.log(`Запускаю сайт на порту ${PORT}…`)
  mkdirSync(path.join(root, '.logs'), { recursive: true })

  const server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '--port', String(PORT)],
    {
      cwd: root,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'ignore',
    },
  )

  server.on('exit', (code) => {
    console.log(`Сервер сайта остановился (код ${code})`)
  })

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (await siteIsUp()) break
  }

  if (!(await siteIsUp())) {
    console.error('Сайт не поднялся. Сначала выполните: npm run build')
    process.exit(1)
  }

  console.log('Сайт поднят')
}

/* ── 3. туннель с проверкой ссылки ───────────────────────────────────────── */

/**
 * Строки, которые не означают поломку: cloudflared пишет их при обычном
 * переподключении. Показывать их пользователю — только пугать.
 */
const NOISE =
  /context canceled|control stream|Cannot determine default|ICMP proxy|metrics server|Version |GOOS|Checksum|precheck|curve preferences|Registered tunnel|Initial protocol|retrying connection|Thank you for trying|no uptime guarantee|created! Visit|Your quick Tunnel|Downloading|INF /i

function isNoise(line) {
  return NOISE.test(line)
}

/**
 * Проверка, что публичная ссылка действительно открывается.
 * Cloudflare иногда отдаёт адрес сразу, а маршрут до него догоняет
 * за минуту — поэтому несколько попыток подряд.
 */
async function linkWorks(url) {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
        headers: { 'User-Agent': 'eli-tunnel-check' },
      })

      if (response.ok) return true

      // 530 — Cloudflare ещё не раздал адрес, ждём дальше
      process.stdout.write(`  попытка ${attempt}: код ${response.status}, ждём…\n`)
    } catch (error) {
      process.stdout.write(`  попытка ${attempt}: ${error.message.slice(0, 60)}\n`)
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  return false
}

/** Запускает туннель с заданным протоколом и ждёт ссылку. */
function startTunnel(protocol) {
  return new Promise((resolve) => {
    const args = ['tunnel', '--url', `http://127.0.0.1:${PORT}`, '--no-autoupdate', '--loglevel', 'warn']

    if (protocol !== 'auto') args.push('--protocol', protocol)

    const child = spawn(cloudflared, args, { stdio: ['ignore', 'pipe', 'pipe'], cwd: root })

    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      resolve({ ...result, child })
    }

    const handle = (chunk) => {
      for (const line of chunk.toString().split('\n')) {
        const trimmed = line.trim()
        if (!trimmed) continue

        const match = trimmed.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
        if (match && !settled) {
          finish({ ok: true, url: match[0], protocol })
          return
        }

        if (/ERR|error/i.test(trimmed) && !isNoise(trimmed)) {
          console.log(`  ${trimmed.slice(0, 110)}`)
        }
      }
    }

    child.stderr.on('data', handle)
    child.stdout.on('data', handle)

    child.on('exit', (code) => {
      finish({ ok: false, protocol, code })
    })

    // Если за 60 секунд ссылка не появилась — считаем попытку неудачной
    setTimeout(() => finish({ ok: false, protocol, timeout: true }), 60_000)
  })
}

console.log('')
console.log('Поднимаю туннель. Это может занять до минуты.')

for (const protocol of PROTOCOLS) {
  console.log('')
  console.log(`Пробую протокол ${protocol}…`)

  const result = await startTunnel(protocol)

  if (!result.ok) {
    console.log(`  не получилось (${result.timeout ? 'нет адреса за минуту' : `код ${result.code}`})`)
    try {
      result.child?.kill()
    } catch {
      // процесс мог уже завершиться
    }
    continue
  }

  console.log('')
  console.log('════════════════════════════════════════════════════════')
  console.log(`  ВАША ССЫЛКА:  ${result.url}`)
  console.log('════════════════════════════════════════════════════════')
  console.log('')
  console.log('Проверяю, что ссылка действительно открывается…')

  const works = await linkWorks(result.url)

  console.log('')
  if (works) {
    console.log('✓ Ссылка работает. Открывайте с телефона и отправляйте кому угодно.')
    console.log('  Живёт, пока открыто это окно. Закрыли — ссылка умерла.')
    console.log('')
    console.log('  Если у знакомого в другой сети не открывается — у него может')
    console.log('  блокироваться сам домен trycloudflare.com, тогда поможет VPN.')
  } else {
    console.log('✗ Ссылка не отвечает.')
    console.log('')
    console.log('  Туннель подключён, но Cloudflare не отдаёт маршрут — так бывает,')
    console.log('  когда провайдер вмешивается в соединение или домен недоступен.')
    console.log('  Пробую другой протокол автоматически…')

    try {
      result.child.kill()
    } catch {
      // уже остановлен
    }
    continue
  }

  // Ссылка работает — держим туннель, пока открыто окно
  process.on('SIGINT', () => {
    result.child.kill()
    process.exit(0)
  })

  result.child.on('exit', (code) => {
    console.log('')
    console.log(`Туннель остановился (код ${code}). Перезапустите start.cmd tunnel — адрес будет новый.`)
    process.exit(code ?? 0)
  })

  // Не даём программе завершиться, пока туннель работает
  await new Promise(() => {})
}

console.log('')
console.log('Не удалось поднять публичную ссылку ни одним протоколом.')
console.log('')
console.log('Что можно попробовать:')
console.log('  1. Включить VPN и запустить start.cmd tunnel снова.')
console.log('  2. Другую сеть — например, мобильный интернет с телефона в режиме модема.')
console.log('  3. Постоянную ссылку: свой домен в Cloudflare и именованный туннель.')
process.exit(1)
