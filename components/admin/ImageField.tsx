'use client'

import { useRef, useState } from 'react'
import { labelClass } from '@/components/admin/ui'

/**
 * Загрузка одной фотографии.
 *
 * Файл уходит на сервер, где sharp сам уменьшает его и конвертирует в WebP,
 * а обратно приходит готовый путь. Поэтому в форме нет ни превью на клиенте,
 * ни прогресса по процентам — обработка занимает доли секунды.
 */

export type ImageValue = {
  path: string
  width: number
  height: number
}

type UploadResponse = ImageValue & { error?: string }

type Props = {
  value: ImageValue | null
  onChange: (value: ImageValue | null) => void
  hint?: string
}

export function ImageField({ value, onChange, hint }: Props) {
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setIsBusy(true)
    setError(null)

    try {
      const body = new FormData()
      body.append('file', file)

      const response = await fetch('/api/admin/upload', { method: 'POST', body })
      const data = (await response.json()) as UploadResponse

      if (!response.ok) {
        setError(data.error ?? 'Не удалось загрузить файл')
        return
      }

      onChange({ path: data.path, width: data.width, height: data.height })
    } catch {
      setError('Сервер не ответил. Проверьте соединение и попробуйте снова.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div>
      <span className={labelClass}>Фотография</span>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          const file = event.dataTransfer.files[0]
          if (file) void upload(file)
        }}
        className={`mt-1 flex items-center gap-4 rounded-brand border border-dashed p-3 transition-colors ${
          isDragging ? 'border-brass bg-brass/5' : 'border-kraft-400 bg-white/40'
        }`}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/60">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.path} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[0.625rem] uppercase tracking-[0.1em] text-ink-soft">
              нет
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void upload(file)
            }}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-9 items-center rounded-brand border border-kraft-400 px-3 text-[0.6875rem] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass disabled:opacity-45"
            >
              {isBusy ? 'Обрабатываю…' : value ? 'Заменить фото' : 'Загрузить фото'}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex min-h-9 items-center px-2 text-[0.6875rem] uppercase tracking-[0.1em] text-berry transition-colors hover:text-ink"
              >
                Убрать
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-ink-soft">
            {error ?? hint ?? 'Перетащите файл сюда или выберите вручную. Фото сжимается автоматически.'}
          </p>
        </div>
      </div>
    </div>
  )
}
