import { SpruceRow } from '@/components/brand/Ornament'
import { ButtonLink } from '@/components/ui/Button'
import { ClockIcon, PhoneIcon, PinIcon } from '@/components/ui/icons'
import { getOpenStatus } from '@/lib/hours'
import { SITE } from '@/lib/site'

/**
 * Первый экран.
 *
 * Фотографий у ресторана пока нет, поэтому сцена собрана из того, что есть
 * у бренда: глубокий хвойный фон, кромка леса внизу и типографика с афиши.
 * Когда появятся фото зала — подставляются сюда как фон без правки вёрстки.
 */
export function Hero() {
  const status = getOpenStatus()

  return (
    <section className="grain-dark relative isolate overflow-hidden bg-forest-900 text-kraft-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(94,122,85,0.28),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="container-page relative flex min-h-[70vh] flex-col items-center justify-center py-16 text-center sm:py-24">
        <p className="eyebrow text-brass-light">Русская кухня · хвойный лес</p>

        <h1 className="mt-6">
          <span className="block font-heading text-5xl leading-none tracking-[0.3em] text-kraft-100 sm:text-7xl">
            ЕЛИ
          </span>
          <span className="sr-only">
            {SITE.name} — ресторан русской кухни, {SITE.city}
          </span>
        </h1>

        <p className="mt-6 font-heading text-2xl italic text-kraft-200 sm:text-3xl">{SITE.tagline}</p>

        <div className="rule-brass-strong mt-8 w-40" aria-hidden="true" />

        <p className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-kraft-200/85">
          {SITE.descriptionShort}
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <ButtonLink href="/menu" variant="primary" size="lg" className="bg-kraft-100 text-forest-900 hover:bg-white">
            Смотреть меню
          </ButtonLink>
          <ButtonLink href="/booking" variant="onDark" size="lg">
            Забронировать стол
          </ButtonLink>
        </div>

        <dl className="mt-12 flex flex-col items-center gap-3 text-sm text-kraft-200/90 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 shrink-0 text-brass-light" />
            <dt className="sr-only">Часы работы сегодня</dt>
            <dd className={status.isOpen ? 'text-kraft-100' : 'text-kraft-200/80'}>{status.message}</dd>
          </div>
          <div className="flex items-center gap-2">
            <PinIcon className="h-4 w-4 shrink-0 text-brass-light" />
            <dt className="sr-only">Адрес</dt>
            <dd>{SITE.addressShort}</dd>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 shrink-0 text-brass-light" />
            <dt className="sr-only">Телефон</dt>
            <dd>
              <a href={SITE.phoneHref} className="tnum transition-colors hover:text-kraft-100">
                {SITE.phoneDisplay}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <div className="pointer-events-none relative h-20 text-forest-700 sm:h-28" aria-hidden="true">
        <SpruceRow className="h-full w-full" />
      </div>
    </section>
  )
}
