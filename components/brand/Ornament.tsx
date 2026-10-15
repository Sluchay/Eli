/**
 * Орнаменты бренда: ель, ряд елей, шишка, разделитель.
 * Всё нарисовано инлайн-SVG: ноль внешних файлов, ноль запросов,
 * масштабируется без потерь и красится currentColor.
 */

type SvgProps = { className?: string }

/** Одна ель силуэтом — как на афише ресторана */
export function Spruce({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 30" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .8 17.2 8h-3.1l4.4 7.2h-3.6l5 8.2h-6.5v4.4h-2.8v-4.4H4.1l5-8.2H5.5L9.9 8H6.8L12 .8Z" />
    </svg>
  )
}

/** Ряд елей — нижняя кромка «леса». Высоты специально разные. */
export function SpruceRow({ className }: SvgProps) {
  const trees = [
    { x: 4, h: 26 },
    { x: 30, h: 38 },
    { x: 60, h: 22 },
    { x: 84, h: 44 },
    { x: 116, h: 30 },
    { x: 142, h: 36 },
    { x: 172, h: 24 },
    { x: 196, h: 40 },
  ]

  return (
    <svg
      viewBox="0 0 224 48"
      preserveAspectRatio="none"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {trees.map((t) => (
        <path
          key={t.x}
          transform={`translate(${t.x} ${48 - t.h}) scale(${t.h / 30})`}
          d="M12 .8 17.2 8h-3.1l4.4 7.2h-3.6l5 8.2h-6.5v4.4h-2.8v-4.4H4.1l5-8.2H5.5L9.9 8H6.8L12 .8Z"
        />
      ))}
    </svg>
  )
}

/** Шишка — «точка» бренда, ставится в разделители и пустые состояния */
export function Pinecone({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 20 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 1.5c3.4 2.6 5.4 6.5 5.4 11.3 0 5.3-2.4 9.4-5.4 11.7-3-2.3-5.4-6.4-5.4-11.7C4.6 8 6.6 4.1 10 1.5Z" />
      <path d="M10 4.2v18.4M5.2 10.4c1.6 1 3 1.4 4.8 1.4s3.2-.4 4.8-1.4M4.8 15.6c1.7 1.1 3.3 1.6 5.2 1.6s3.5-.5 5.2-1.6M6.4 20.4c1.2.7 2.3 1 3.6 1s2.4-.3 3.6-1" />
    </svg>
  )
}

/** Разделитель секции: линейка — шишка — линейка */
export function OrnamentDivider({ className }: SvgProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`} aria-hidden="true">
      <span className="rule-brass flex-1" />
      <Pinecone className="h-4 w-auto text-brass" />
      <span className="rule-brass flex-1" />
    </div>
  )
}
