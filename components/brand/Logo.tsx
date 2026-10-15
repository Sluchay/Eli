/**
 * Логотип «ЕЛИ».
 *
 * Знак устроен как двойное чтение: вертикальный ствол слева и три
 * укорачивающиеся ветви — это одновременно буква «Е» и силуэт ели.
 * Вторая буква-смысл названия: «ели» — дерево и «ели» — глагол.
 */

type LogoMarkProps = { className?: string }

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 26 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      {/* ствол — вертикаль буквы Е */}
      <path d="M4 2v28" />
      {/* ветви: три яруса, каждый короче предыдущего */}
      <path d="M4 6.5h17" />
      <path d="M4 15h12.5" />
      <path d="M4 23.5h8" />
      {/* макушка */}
      <path d="M4 6.5 11.5 1.5" strokeWidth="1.3" />
    </svg>
  )
}

type LogoProps = {
  className?: string
  /** Подпись «ресторан» под словом */
  withSubtitle?: boolean
  /** Цветовая схема: на крафте или на тёмном фоне */
  tone?: 'dark' | 'light'
}

export function Logo({ className, withSubtitle = true, tone = 'dark' }: LogoProps) {
  const wordColor = tone === 'dark' ? 'text-forest-700' : 'text-kraft-100'
  const markColor = tone === 'dark' ? 'text-brass' : 'text-brass-light'
  const subColor = tone === 'dark' ? 'text-ink-soft' : 'text-kraft-300'

  return (
    <span className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark className={`h-7 w-auto shrink-0 sm:h-8 ${markColor}`} />
      <span className="flex flex-col justify-center">
        <span
          className={`font-heading text-[1.375rem] leading-none tracking-[0.26em] sm:text-2xl ${wordColor}`}
        >
          ЕЛИ
        </span>
        {withSubtitle && (
          <span
            className={`mt-1 font-body text-[0.5rem] font-medium uppercase leading-none tracking-[0.34em] ${subColor}`}
          >
            ресторан
          </span>
        )}
      </span>
    </span>
  )
}
