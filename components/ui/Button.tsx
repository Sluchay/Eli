import Link from 'next/link'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'light' | 'outline' | 'onDark' | 'quiet'
type Size = 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-brand font-body font-semibold uppercase ' +
  'tracking-[0.1em] transition-colors duration-200 min-h-11 px-5 py-2.5 text-center ' +
  'disabled:cursor-not-allowed disabled:opacity-45'

/**
 * Варианты кнопки.
 *
 * ВАЖНО: цвет кнопки нельзя перебивать через className. Два класса одного
 * свойства (например, bg-forest-700 из варианта и bg-kraft-100 из className)
 * не «перекрывают» друг друга — побеждает тот, что ниже в собранном CSS.
 * Пока цвета совпадали, это было незаметно; когда разошлись, кнопка
 * «Смотреть меню» на главной получила светлый фон и светлый текст сразу,
 * то есть контраст 1:1 и невидимую надпись.
 *
 * Для светлой кнопки на тёмном фоне есть отдельный вариант light.
 */
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-forest-700 text-kraft-100 hover:bg-forest-500',
  /** Светлая кнопка для тёмных секций: герой, финальный призыв */
  light: 'bg-kraft-100 text-forest-900 hover:bg-white',
  outline: 'border border-kraft-400 text-ink hover:border-brass hover:text-forest-700 bg-transparent',
  onDark: 'border border-kraft-300/45 text-kraft-100 hover:bg-kraft-100/10',
  quiet: 'text-forest-700 hover:text-brass underline underline-offset-4 decoration-kraft-400',
}

const SIZES: Record<Size, string> = {
  md: 'text-[0.75rem]',
  lg: 'text-[0.8125rem] min-h-12 px-7',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim()
}

type ButtonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonProps & Omit<React.ComponentPropsWithoutRef<'button'>, 'className' | 'children'>) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonProps & { href: string } & Omit<
    React.ComponentPropsWithoutRef<'a'>,
    'className' | 'children' | 'href'
  >) {
  const isExternal = /^https?:|^tel:|^mailto:/.test(href)

  if (isExternal) {
    return (
      <a href={href} className={buttonClass(variant, size, className)} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  )
}
