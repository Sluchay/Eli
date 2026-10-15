import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * Хеширование паролей на встроенном scrypt из node:crypto.
 *
 * Почему не bcrypt/argon2: обе требуют нативной сборки или отдельного пакета,
 * а scrypt уже встроен в Node, считается стойким и рекомендован OWASP.
 * Меньше зависимостей — меньше поводов что-то сломать при обновлении.
 *
 * Формат записи: scrypt$N$r$p$<salt-base64url>$<hash-base64url>
 */

const PARAMS = { N: 16384, r: 8, p: 1 } as const
const KEY_LENGTH = 64
const MAX_MEM = 64 * 1024 * 1024

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password.normalize('NFKC'), salt, KEY_LENGTH, { ...PARAMS, maxmem: MAX_MEM })
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64url'),
    hash.toString('base64url'),
  ].join('$')
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$')
  if (parts.length !== 6) return false

  const [scheme, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts
  if (scheme !== 'scrypt' || !nRaw || !rRaw || !pRaw || !saltRaw || !hashRaw) return false

  const N = Number.parseInt(nRaw, 10)
  const r = Number.parseInt(rRaw, 10)
  const p = Number.parseInt(pRaw, 10)
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false

  let salt: Buffer
  let expected: Buffer
  try {
    salt = Buffer.from(saltRaw, 'base64url')
    expected = Buffer.from(hashRaw, 'base64url')
  } catch {
    return false
  }
  if (expected.length === 0) return false

  const actual = scryptSync(password.normalize('NFKC'), salt, expected.length, {
    N,
    r,
    p,
    maxmem: MAX_MEM,
  })

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
