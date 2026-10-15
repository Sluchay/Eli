import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES, saveImage } from '@/lib/upload'

export const runtime = 'nodejs'

/**
 * Загрузка одного изображения из админки.
 *
 * Проверки: пользователь авторизован, тип файла из белого списка, размер
 * в пределах лимита. Дальше sharp сам решает, как сжать и во что конвертировать.
 */
export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Нужно войти заново' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не получен' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Поддерживаются только JPEG, PNG, WebP и AVIF' },
      { status: 400 },
    )
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Файл больше 12 МБ — сожмите его перед загрузкой' }, { status: 400 })
  }

  try {
    const saved = await saveImage(Buffer.from(await file.arrayBuffer()))
    return NextResponse.json(saved)
  } catch (error) {
    console.error('Не удалось обработать изображение', error)
    return NextResponse.json({ error: 'Не удалось обработать изображение' }, { status: 500 })
  }
}
