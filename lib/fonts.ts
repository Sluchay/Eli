import { Golos_Text, Old_Standard_TT } from 'next/font/google'

/**
 * Шрифты подключены через next/font: файлы скачиваются на этапе сборки
 * и раздаются с нашего домена. Никаких обращений к CDN в рантайме —
 * сайт работает в локальной сети ресторана без интернета.
 */

export const headingFont = Old_Standard_TT({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-heading-family',
})

export const bodyFont = Golos_Text({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-body-family',
})
