import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

/**
 * Сессия администратора.
 *
 * Своя подписанная cookie вместо отдельной библиотеки: значение — это
 * base64url(JSON) + подпись HMAC-SHA256 на AUTH_SECRET. Ничего лишнего
 * в зависимостях, и нет ничего, что нельзя проверить глазами.
 *
 * Аккаунт ровно один (владелец или назначенный менеджер), но модель User
 * и роли уже на месте: если появится второй человек, менять схему не придётся.
 */

const COOKIE_NAME = 'eli_admin'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // неделя

export type SessionUser = {
  id: string
  email: string
  name: string
  role: string
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error(
      'Не задан AUTH_SECRET. Укажите в .env случайную строку не короче 32 символов.',
    )
  }
  return secret
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

type TokenPayload = { uid: string; exp: number }

function createToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE_SECONDS * 1000 } satisfies TokenPayload),
    'utf8',
  ).toString('base64url')

  return `${payload}.${sign(payload)}`
}

function readToken(token: string | undefined): string | null {
  if (!token) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof parsed !== 'object' || parsed === null) return null

    const { uid, exp } = parsed as Partial<TokenPayload>
    if (typeof uid !== 'string' || typeof exp !== 'number' || exp < Date.now()) return null

    return uid
  } catch {
    return null
  }
}

/** Кука помечается secure только если сайт реально работает по HTTPS. */
function isSecureCookie(): boolean {
  return (process.env.SITE_URL ?? '').startsWith('https://')
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const userId = readToken(store.get(COOKIE_NAME)?.value)
  if (!userId) return null

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

/** Для страниц админки: нет сессии — уводим на вход. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')
  return user
}

export async function startSession(userId: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, createToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookie(),
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function endSession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
