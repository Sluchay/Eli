'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { inputToKopecks } from '@/lib/money'
import { verifyPassword } from '@/lib/password'
import { endSession, requireAdmin, startSession } from '@/lib/session'

/* ────────────────────────────────────────────────────────────────────────────
   Разбор данных формы.
   Функции не экспортируются: файл с 'use server' отдаёт наружу только
   серверные действия, всё остальное остаётся внутренним.
   ──────────────────────────────────────────────────────────────────────────── */

function text(form: FormData, key: string): string | null {
  const value = form.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function number(form: FormData, key: string): number | null {
  const raw = text(form, key)
  if (raw === null) return null
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function decimal(form: FormData, key: string): number | null {
  const raw = text(form, key)
  if (raw === null) return null
  const parsed = Number.parseFloat(raw.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function flag(form: FormData, key: string): boolean {
  const value = form.get(key)
  return value === 'on' || value === 'true' || value === '1'
}

/** Галочки «Аллергены» и «Метки» складываются в JSON-массив. */
function jsonList(form: FormData, key: string): string {
  const values = form.getAll(key).filter((value): value is string => typeof value === 'string')
  return JSON.stringify(values)
}

/**
 * Варианты блюда (размеры пиццы) приходят JSON-строкой из скрытого поля.
 *
 * Форма собирает их в браузере, поэтому на сервер может прийти что угодно:
 * пустая строка, битый JSON, цены строкой. Здесь всё нормализуется к одному
 * виду, а мусор отбрасывается — иначе одна кривая запись сломает карточку.
 */
function jsonVariants(form: FormData, key: string): string {
  const raw = text(form, key)
  if (raw === null) return '[]'

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return '[]'
  }

  if (!Array.isArray(parsed)) return '[]'

  const cleaned: {
    label: string
    price: number | null
    weight: string | null
    priceNote: string | null
    description: string | null
    isDefault: boolean
  }[] = []

  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>

    const label = typeof record.label === 'string' ? record.label.trim() : ''
    if (!label) continue

    // Цена варианта приходит в рублях, в базе — в копейках
    const priceRub =
      typeof record.price === 'number'
        ? record.price
        : Number.parseFloat(String(record.price ?? '').replace(',', '.'))

    const price = Number.isFinite(priceRub) && priceRub > 0 ? Math.round(priceRub * 100) : null

    const weight = typeof record.weight === 'string' ? record.weight.trim() : ''
    const priceNote = typeof record.priceNote === 'string' ? record.priceNote.trim() : ''
    const description = typeof record.description === 'string' ? record.description.trim() : ''

    cleaned.push({
      label,
      price,
      weight: weight || null,
      priceNote: priceNote || null,
      description: description || null,
      isDefault: record.isDefault === true,
    })
  }

  // Ровно один вариант может быть выбран по умолчанию
  const defaultSeen = { done: false }
  for (const variant of cleaned) {
    if (variant.isDefault && !defaultSeen.done) {
      defaultSeen.done = true
    } else {
      variant.isDefault = false
    }
  }

  return JSON.stringify(cleaned)
}

/** Значение поля datetime-local: «2026-10-17T20:00». */
function dateTime(form: FormData, key: string): Date | null {
  const raw = text(form, key)
  if (raw === null) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Журнал изменений не должен ломать основное действие, поэтому ошибки глотаем. */
async function writeLog(
  userId: string,
  action: string,
  entity: string,
  entityId: string | null,
  payload?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        payload: payload ? JSON.stringify(payload) : null,
      },
    })
  } catch {
    // молча: журнал — вспомогательная история, а не часть транзакции
  }
}

/* ── вход и выход ─────────────────────────────────────────────────────────── */

export async function loginAction(formData: FormData): Promise<void> {
  const email = text(formData, 'email')?.toLowerCase() ?? ''
  const password = text(formData, 'password') ?? ''

  const user = email ? await prisma.user.findUnique({ where: { email } }) : null
  const passwordOk = user ? verifyPassword(password, user.passwordHash) : false

  if (!user || !passwordOk) {
    // Небольшая задержка против перебора пароля. Настоящее ограничение
    // скорости ставится на уровне веб-сервера — см. README.
    await new Promise((resolve) => setTimeout(resolve, 700))
    redirect(`/admin/login?error=1&email=${encodeURIComponent(email)}`)
  }

  await startSession(user.id)
  redirect('/admin/menu')
}

export async function logoutAction(): Promise<void> {
  await endSession()
  redirect('/admin/login')
}

/* ── блюда ────────────────────────────────────────────────────────────────── */

export async function saveItemAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()

  const id = text(formData, 'id')
  const sectionId = text(formData, 'sectionId')
  const name = text(formData, 'name')

  if (!sectionId || !name) {
    redirect(id ? `/admin/items/${id}?error=required` : '/admin/menu?error=required')
  }

  const data = {
    sectionId,
    name,
    description: text(formData, 'description'),
    // В форме цена в рублях, в базе — в копейках. Перевод в одном месте.
    price: inputToKopecks(text(formData, 'price')),
    priceNote: text(formData, 'priceNote'),
    weight: text(formData, 'weight'),
    volume: text(formData, 'volume'),
    composition: text(formData, 'composition'),
    allergens: jsonList(formData, 'allergens'),
    calories: number(formData, 'calories'),
    protein: decimal(formData, 'protein'),
    fat: decimal(formData, 'fat'),
    carbs: decimal(formData, 'carbs'),
    badges: jsonList(formData, 'badges'),
    variants: jsonVariants(formData, 'variants'),
    isVisible: flag(formData, 'isVisible'),
    isStopList: flag(formData, 'isStopList'),
    sortOrder: number(formData, 'sortOrder') ?? 0,
  }

  const itemId = id
    ? (await prisma.menuItem.update({ where: { id }, data })).id
    : (await prisma.menuItem.create({ data })).id

  const imagePath = text(formData, 'imagePath')
  if (imagePath) {
    await prisma.menuItemImage.deleteMany({ where: { itemId } })
    await prisma.menuItemImage.create({
      data: {
        itemId,
        path: imagePath,
        width: number(formData, 'imageWidth') ?? 0,
        height: number(formData, 'imageHeight') ?? 0,
        isPrimary: true,
        alt: name,
      },
    })
  }

  await writeLog(user.id, id ? 'update' : 'create', 'MenuItem', itemId, { name })
  revalidatePath('/admin/menu')
  revalidatePath('/menu')

  redirect(`/admin/items/${itemId}?ok=1`)
}

/** Переключатели «в наличии» и «показывать» — одна кнопка, без захода в карточку. */
export async function toggleItemFlagAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()

  const id = text(formData, 'id')
  const field = text(formData, 'field')
  if (!id || (field !== 'isStopList' && field !== 'isVisible')) return

  const item = await prisma.menuItem.findUnique({ where: { id } })
  if (!item) return

  const nextValue = field === 'isStopList' ? !item.isStopList : !item.isVisible

  await prisma.menuItem.update({
    where: { id },
    data: field === 'isStopList' ? { isStopList: nextValue } : { isVisible: nextValue },
  })

  await writeLog(user.id, 'toggle', 'MenuItem', id, { field, value: nextValue })
  revalidatePath('/admin/menu')
  revalidatePath('/admin/stop-list')
  revalidatePath('/menu')
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()
  const id = text(formData, 'id')

  if (id) {
    await prisma.menuItem.delete({ where: { id } })
    await writeLog(user.id, 'delete', 'MenuItem', id)
  }

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  redirect('/admin/menu')
}

/* ── разделы ──────────────────────────────────────────────────────────────── */

export async function saveSectionAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()

  const id = text(formData, 'id')
  const title = text(formData, 'title')
  if (!title) redirect('/admin/menu?error=section')

  const data = {
    title,
    description: text(formData, 'description'),
    iconKey: text(formData, 'iconKey') ?? 'starter',
    availableFrom: text(formData, 'availableFrom'),
    availableTo: text(formData, 'availableTo'),
    sortOrder: number(formData, 'sortOrder') ?? 0,
    isVisible: flag(formData, 'isVisible'),
  }

  if (id) {
    await prisma.menuSection.update({ where: { id }, data })
    await writeLog(user.id, 'update', 'MenuSection', id, { title })
  } else {
    const created = await prisma.menuSection.create({
      data: { ...data, slug: `section-${Date.now().toString(36)}` },
    })
    await writeLog(user.id, 'create', 'MenuSection', created.id, { title })
  }

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  redirect('/admin/menu?ok=1')
}

/* ── бизнес-ланч ──────────────────────────────────────────────────────────── */

/** Надпись про часы подачи ланча — одна строка в настройках сайта. */
export async function saveLunchNoteAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()

  const note = text(formData, 'lunchNote')
  const enabled = flag(formData, 'lunchEnabled')

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { lunchNote: note, lunchEnabled: enabled },
    create: { id: 1, lunchNote: note, lunchEnabled: enabled },
  })

  await writeLog(user.id, 'update', 'SiteSettings', '1', { lunchNote: note, lunchEnabled: enabled })
  revalidatePath('/admin/lunch')
  revalidatePath('/lunch')

  redirect('/admin/lunch?ok=1')
}

export async function saveLunchAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()

  const id = text(formData, 'id')
  const data = {
    title: text(formData, 'title') ?? 'Бизнес-ланч',
    description: text(formData, 'description'),
    price: inputToKopecks(text(formData, 'price')),
    priceNote: text(formData, 'priceNote'),
    imagePath: text(formData, 'imagePath'),
    validFrom: dateTime(formData, 'validFrom'),
    validTo: dateTime(formData, 'validTo'),
    isPublished: flag(formData, 'isPublished'),
    sortOrder: number(formData, 'sortOrder') ?? 0,
  }

  const lunchId = id
    ? (await prisma.businessLunch.update({ where: { id }, data })).id
    : (await prisma.businessLunch.create({ data })).id

  await writeLog(user.id, id ? 'update' : 'create', 'BusinessLunch', lunchId, { title: data.title })
  revalidatePath('/admin/lunch')
  revalidatePath('/lunch')

  redirect('/admin/lunch?ok=1')
}

export async function deleteLunchAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()
  const id = text(formData, 'id')

  if (id) {
    await prisma.businessLunch.delete({ where: { id } })
    await writeLog(user.id, 'delete', 'BusinessLunch', id)
  }

  revalidatePath('/admin/lunch')
  revalidatePath('/lunch')
  redirect('/admin/lunch')
}

/* ── афиша ────────────────────────────────────────────────────────────────── */

export async function saveEventAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()

  const id = text(formData, 'id')
  const data = {
    // Заголовок и дата необязательны: анонс из соцсетей — это фото и подпись.
    title: text(formData, 'title'),
    description: text(formData, 'description'),
    startsAt: dateTime(formData, 'startsAt'),
    price: inputToKopecks(text(formData, 'price')),
    priceNote: text(formData, 'priceNote'),
    imagePath: text(formData, 'imagePath'),
    // Размеры нужны странице афиши, чтобы заранее занять место под кадр:
    // без них на телефоне вёрстка «прыгает», пока грузится вертикальное фото.
    imageWidth: number(formData, 'imageWidth'),
    imageHeight: number(formData, 'imageHeight'),
    bookingPhone: text(formData, 'bookingPhone'),
    isPublished: flag(formData, 'isPublished'),
    sortOrder: number(formData, 'sortOrder') ?? 0,
  }

  const eventId = id
    ? (await prisma.event.update({ where: { id }, data })).id
    : (await prisma.event.create({ data })).id

  await writeLog(user.id, id ? 'update' : 'create', 'Event', eventId, { title: data.title })
  revalidatePath('/admin/events')
  revalidatePath('/events')

  redirect('/admin/events?ok=1')
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const user = await requireAdmin()
  const id = text(formData, 'id')

  if (id) {
    await prisma.event.delete({ where: { id } })
    await writeLog(user.id, 'delete', 'Event', id)
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  redirect('/admin/events')
}
