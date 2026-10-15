import type { ReactNode } from 'react'
import { OrnamentDivider } from '@/components/brand/Ornament'

type Tone = 'kraft' | 'kraft-alt' | 'dark'

const TONES: Record<Tone, string> = {
  kraft: 'bg-transparent text-ink',
  'kraft-alt': 'bg-kraft-200/70 text-ink',
  dark: 'bg-forest-900 text-kraft-100',
}

type SectionProps = {
  id?: string
  tone?: Tone
  className?: string
  children: ReactNode
  /** Внутренние вертикальные отступы: обычные или плотные */
  size?: 'md' | 'lg'
}

export function Section({ id, tone = 'kraft', size = 'md', className, children }: SectionProps) {
  const padding = size === 'lg' ? 'py-16 sm:py-24' : 'py-12 sm:py-16'

  return (
    <section id={id} className={`${TONES[tone]} ${padding} ${className ?? ''}`}>
      <div className="container-page">{children}</div>
    </section>
  )
}

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  tone?: 'dark' | 'light'
  align?: 'left' | 'center'
  ornament?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'dark',
  align = 'left',
  ornament = false,
}: SectionHeadingProps) {
  const isCentered = align === 'center'
  const titleColor = tone === 'dark' ? 'text-forest-700' : 'text-kraft-100'
  const descriptionColor = tone === 'dark' ? 'text-ink-soft' : 'text-kraft-200/85'

  return (
    <header className={`${isCentered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className={`font-heading text-3xl sm:text-4xl ${titleColor}`}>{title}</h2>
      {ornament && <OrnamentDivider className={`mt-5 ${isCentered ? 'mx-auto max-w-xs' : 'max-w-xs'}`} />}
      {description && (
        <p className={`mt-5 text-[1.0625rem] leading-relaxed ${descriptionColor}`}>{description}</p>
      )}
    </header>
  )
}
