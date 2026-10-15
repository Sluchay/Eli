'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { requireAdmin } from '@/lib/session'

/**
 * Доступы в админку: смена своего пароля и управление другими пользователями.
 *
 * Вынесено отдельно от действий с меню: это редкая операция с другими
 * правилами (свои проверки прав), и держать её в одном файле с блюдами
 * незачем.
 */

const MIN_PASSWORD_LENGTH = 8

function text(form: FormData, key: string): string | null {
  const value = form.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** Сменить свой пароль. Текущий спрашиваем — на случай, если кто-то подсел за компьютер. */
export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()

  const current = text(formData, 'currentPassword') ?? ''
  const next = text(formData, 'newPassword') ?? ''
  const repeat = text(formData, 'repeatPassword') ?? ''

  const record = await prisma.user.findUnique({ where: { id: user.id } })
  if (!record || !verifyPassword(current, record.passwordHash)) {
    redirect('/admin/users?error=current')
  }

  if (next.length < MIN_PASSWORD_LENGTH) redirect('/admin/users?error=short')
  if (next !== repeat) redirect('/admin/users?error=mismatch')

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(next) },
  })

  await prisma.auditLog
    .create({
      data: { userId: user.id, action: 'update', entity: 'User', entityId: user.id, payload: null },
    })
    .catch(() => undefined)

  revalidatePath('/admin/users')
  redirect('/admin/users?ok=password')
}

/** Добавить второго пользователя: управляющего или редактора. */
export async function createUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (admin.role !== 'ADMIN') redirect('/admin/users?error=forbidden')

  const email = text(formData, 'email')?.toLowerCase() ?? ''
  const name = text(formData, 'name') ?? ''
  const role = text(formData, 'role') === 'ADMIN' ? 'ADMIN' : 'EDITOR'
  const password = text(formData, 'password') ?? ''

  if (!email.includes('@') || email.length < 5) redirect('/admin/users?error=email')
  if (password.length < MIN_PASSWORD_LENGTH) redirect('/admin/users?error=short')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) redirect('/admin/users?error=exists')

  const created = await prisma.user.create({
    data: { email, name, role, passwordHash: hashPassword(password) },
  })

  await prisma.auditLog
    .create({
      data: {
        userId: admin.id,
        action: 'create',
        entity: 'User',
        entityId: created.id,
        payload: JSON.stringify({ email, role }),
      },
    })
    .catch(() => undefined)

  revalidatePath('/admin/users')
  redirect('/admin/users?ok=created')
}

/**
 * Удалить пользователя.
 *
 * Две защиты: нельзя удалить себя и нельзя остаться без единственного
 * администратора — иначе в админку больше некому будет войти.
 */
export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (admin.role !== 'ADMIN') redirect('/admin/users?error=forbidden')

  const id = text(formData, 'id')
  if (!id) redirect('/admin/users')
  if (id === admin.id) redirect('/admin/users?error=self')

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) redirect('/admin/users')

  if (target.role === 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (admins <= 1) redirect('/admin/users?error=lastadmin')
  }

  await prisma.user.delete({ where: { id } })

  await prisma.auditLog
    .create({
      data: {
        userId: admin.id,
        action: 'delete',
        entity: 'User',
        entityId: id,
        payload: JSON.stringify({ email: target.email }),
      },
    })
    .catch(() => undefined)

  revalidatePath('/admin/users')
  redirect('/admin/users?ok=deleted')
}
