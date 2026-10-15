/**
 * Мелкие общие кусочки админки: классы полей, карточка, уведомление.
 * Это обычный модуль без 'use client' — его могут импортировать и серверные,
 * и клиентские компоненты.
 */

export const inputClass =
  'mt-1 w-full min-h-11 rounded-brand border border-kraft-300 bg-white/70 px-3 py-2 text-ink focus:border-brass focus:outline-none'

export const labelClass = 'block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft'

export const cardClass = 'rounded-brand border border-kraft-300 bg-kraft-100/70 p-4 sm:p-5'

export const smallButtonClass =
  'inline-flex min-h-9 items-center justify-center rounded-brand border border-kraft-400 px-3 text-[0.6875rem] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass disabled:opacity-45'

type NoticeProps = {
  tone?: 'ok' | 'error'
  children: React.ReactNode
}

export function Notice({ tone = 'ok', children }: NoticeProps) {
  const styles =
    tone === 'ok'
      ? 'border-ok/40 bg-ok/10 text-ok'
      : 'border-berry/40 bg-berry/10 text-berry'

  return (
    <p role="status" className={`mt-6 rounded-brand border px-3 py-2 text-sm ${styles}`}>
      {children}
    </p>
  )
}

/* Значения для полей ввода даты: браузер понимает только свой формат. */

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Для input[type=date]: «2026-10-17» */
export function toDateInput(date: Date | null | undefined): string {
  if (!date) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Для input[type=datetime-local]: «2026-10-17T20:00» */
export function toDateTimeInput(date: Date | null | undefined): string {
  if (!date) return ''
  return `${toDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
