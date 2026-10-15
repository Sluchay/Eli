/**
 * Набор иконок одним файлом: инлайн-SVG, currentColor, без внешних библиотек.
 * Все декоративные иконки помечены aria-hidden — смысл передаёт текст рядом.
 */

type IconProps = { className?: string }

function Base({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6.2 2.5H3.6c-.6 0-1.1.5-1.1 1.1 0 7.6 6.2 13.8 13.8 13.8.6 0 1.1-.5 1.1-1.1v-2.6l-3.5-1.3-1.5 1.9a11.6 11.6 0 0 1-4.8-4.8l1.9-1.5L6.2 2.5Z" />
    </Base>
  )
}

export function PinIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M10 18s6-5.2 6-9.4A6 6 0 0 0 4 8.6C4 12.8 10 18 10 18Z" />
      <circle cx="10" cy="8.4" r="2.2" />
    </Base>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.6V10l3.1 1.9" />
    </Base>
  )
}

export function MenuListIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 5.5h12M4 10h12M4 14.5h7" />
    </Base>
  )
}

export function MusicIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M7.5 14.5V5.2l8-1.7v9.3" />
      <circle cx="5.6" cy="15.2" r="2" />
      <circle cx="13.6" cy="13.6" r="2" />
    </Base>
  )
}

export function FlameIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M10 2.5c3 3.4 4.6 5.9 4.6 8.6a4.6 4.6 0 0 1-9.2 0c0-1.4.6-2.7 1.6-3.9.4 1.6 1.4 2.4 2.3 2.4.9 0 1.3-.7 1.3-1.6 0-1.5-.3-3.2-.6-5.5Z" />
    </Base>
  )
}

export function ChefIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5.5 8.2a2.9 2.9 0 1 1 2-4.9 3 3 0 0 1 5 0 2.9 2.9 0 1 1 2 4.9v2H5.5v-2Z" />
      <path d="M7 10.2v6.3h6v-6.3" />
    </Base>
  )
}

export function GlassIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4.5 4h11l-4.2 6v5.4M11.3 15.4h3.4M8.6 15.4h6.8" />
    </Base>
  )
}

export function HouseIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3.5 9.5 10 4l6.5 5.5v6.5h-13v-6.5Z" />
      <path d="M8 16.5v-4h4v4" />
    </Base>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5.5 8 10 12.5 14.5 8" />
    </Base>
  )
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M10 16V5M5.5 9.5 10 5l4.5 4.5" />
    </Base>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.2 13.2 17 17" />
    </Base>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </Base>
  )
}

export function LeafIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M17 3.5c0 7-4.2 11-9.5 11H4C4 8 8.2 4.6 13.4 4.6h3.6Z" />
      <path d="M4 17c1.6-4.4 4.4-7.6 8.4-9.6" />
    </Base>
  )
}

export function FishIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 10c2.6-3.4 5.8-5 9.4-5 2.4 0 4.6.9 6.6 2.6-1 1.6-1.5 3.2-1.5 4.8 0 1.6.5 3.2 1.5 4.8-2 1.7-4.2 2.6-6.6 2.6-3.6 0-6.8-1.6-9.4-5 .8-.9 1.2-1.7 1.2-2.4S3.8 10.9 3 10Z" />
      <circle cx="13.4" cy="8.6" r="0.9" />
    </Base>
  )
}

export function BowlIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 9.5h14c0 4-3.1 7-7 7s-7-3-7-7Z" />
      <path d="M7 6.2c0-1 .8-1.4.8-2.4M10 5.6c0-1 .8-1.4.8-2.4M13 6.2c0-1 .8-1.4.8-2.4" />
    </Base>
  )
}

export function CakeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 16.5V10h12v6.5M4 13h12" />
      <path d="M10 10V7.4M10 5.6V4.4" />
      <path d="M3 16.5h14" />
    </Base>
  )
}

export function WheatIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M10 17.5V7" />
      <path d="M10 7c1.6 0 2.6-1 2.6-2.6C11 4.4 10 5.4 10 7Zm0 0c-1.6 0-2.6-1-2.6-2.6C9 4.4 10 5.4 10 7Z" />
      <path d="M10 11.4c1.9 0 3.1-1.2 3.1-3.1-1.9 0-3.1 1.2-3.1 3.1Zm0 0c-1.9 0-3.1-1.2-3.1-3.1 1.9 0 3.1 1.2 3.1 3.1Z" />
    </Base>
  )
}

export function SpruceIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M10 2.5 13.4 7h-2l2.8 4.4h-2.2l3.1 5H4.9l3.1-5H5.8L8.6 7h-2L10 2.5Z" />
      <path d="M10 16.9v2.6" />
    </Base>
  )
}

export function JarIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6.5 6.5h7v9.6a1.9 1.9 0 0 1-1.9 1.9H8.4a1.9 1.9 0 0 1-1.9-1.9V6.5Z" />
      <path d="M5.8 4.2h8.4v2.3H5.8z" />
      <path d="M8 10.5h4" />
    </Base>
  )
}

export function PizzaIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M10 3.2 16.8 16a13.4 13.4 0 0 1-13.6 0L10 3.2Z" />
      <path d="M8.8 8.6h.01M12.4 12.2h.01" />
      <path d="M6.6 6.4h6.8" />
    </Base>
  )
}

export function PotIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4.6 8h10.8v5.4a3 3 0 0 1-3 3H7.6a3 3 0 0 1-3-3V8Z" />
      <path d="M3.2 8h13.6" />
      <path d="M8 5.8V4.2M12 5.8V4.2" />
    </Base>
  )
}

export function CupIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4.4 6h9.2v4.6a4.1 4.1 0 0 1-4.1 4.1h-1a4.1 4.1 0 0 1-4.1-4.1V6Z" />
      <path d="M13.6 7.6H15a2.1 2.1 0 0 1 0 4.2h-1.4" />
      <path d="M4 17.6h10.4" />
    </Base>
  )
}
