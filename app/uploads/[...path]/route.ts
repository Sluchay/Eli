import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { uploadRoot } from '@/lib/upload'

/**
 * Раздача загруженных изображений.
 *
 * Файлы лежат вне public/ — в каталоге data/uploads, который монтируется
 * томом в Docker. Так они переживают пересборку образа и не попадают в git.
 * Имена файлов неизменяемы, поэтому кэш можно держать вечным.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params

  // Никаких «..» и разделителей: имя собирается только из простых сегментов.
  const safeSegments = segments.filter(
    (segment) => segment !== '..' && segment !== '.' && !segment.includes('/') && !segment.includes('\\'),
  )

  const root = uploadRoot()
  const filePath = path.resolve(root, ...safeSegments)

  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    return new NextResponse('Не найдено', { status: 404 })
  }

  try {
    const file = await readFile(filePath)
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Не найдено', { status: 404 })
  }
}
