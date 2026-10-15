import { About } from '@/components/public/About'
import { Atmosphere } from '@/components/public/Atmosphere'
import { FinalCta } from '@/components/public/FinalCta'
import { Hero } from '@/components/public/Hero'
import { HoursContacts } from '@/components/public/HoursContacts'
import { QuickActions } from '@/components/public/QuickActions'

/**
 * Часы работы и статус «открыто сейчас» считаются на сервере при каждом запросе,
 * поэтому страница рендерится динамически. Для небольшого ресторана это доли
 * миллисекунды, зато гость никогда не увидит устаревшее «открыто».
 */
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickActions />
      <About />
      <Atmosphere />
      <HoursContacts />
      <FinalCta />
    </>
  )
}
