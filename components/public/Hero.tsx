import { ForestEdge } from '@/components/brand/Ornament'
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
    <section className="relative isolate overflow-hidden text-kraft-100">
      {/* ОДИН фон на всю секцию, сверху донизу.
          Раньше их было три: тёмная плашка героя, такая же плашка под лесом
          и отдельные заливки у деревьев. На стыке появлялась заметная полоса,
          а без зерна обрывалась ещё и текстура бумаги — отсюда чувство двух
          наложенных картинок. Теперь градиент один и непрерывный:
          глубокий хвойный сверху → хвойный → дымка у самой земли. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#16281f_0%,#16281f_14%,#1a2d22_38%,#22382b_62%,#31483a_82%,#3f5747_100%)]"
        aria-hidden="true"
      />
      {/* Мягкий свет сверху — тот же, что был, но поверх общего градиента */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_22%,rgba(94,122,85,0.2),transparent_55%)]"
        aria-hidden="true"
      />
      {/* Зерно бумаги на всю секцию: раньше оно обрывалось на границе героя */}
      <div className="grain-dark pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container-page relative flex min-h-[70vh] flex-col items-center justify-center py-16 text-center sm:py-24">
        <p className="eyebrow text-brass-light">Русская кухня · хвойный лес</p>

        <h1 className="mt-6">
          <span className="block font-heading text-5xl leading-none tracking-[0.3em] text-kraft-100 sm:text-7xl">
            ЕЛИ
          </span>
          <span className="sr-only">
            {SITE.name} — ресторан русской кухни{SITE.city ? `, ${SITE.city}` : ''}
          </span>
        </h1>

        <p className="mt-6 font-heading text-2xl italic text-kraft-200 sm:text-3xl">{SITE.tagline}</p>

        <div className="rule-brass-strong mt-8 w-40" aria-hidden="true" />

        <p className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-kraft-200/85">
          {SITE.descriptionShort}
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          {/* Светлая кнопка — вариант light, а не перекраска primary через
              className: иначе цвета конфликтуют и надпись пропадает. */}
          <ButtonLink
            href="/menu"
            variant="light"
            size="lg"
            className="ring-1 ring-kraft-300/60 ring-offset-2 ring-offset-forest-900"
          >
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

      {/* Кромка леса.
          Деревья не «нарисованы поверх» отдельного прямоугольника: у полосы
          нет своего фона, а лес полупрозрачен. Поэтому он читается как силуэт
          на общем фоне, а не как наклеенная картинка.
          Низ полосы заходит под секцию действий (отрицательный отступ ниже),
          и стволы прячутся за ней, а не обрываются по прямой линии. */}
      <div
        className="relative z-0 -mb-[clamp(2.25rem,9vw,4.5rem)] h-[clamp(13rem,32vw,21rem)]"
        aria-hidden="true"
      >
        <ForestEdge className="absolute inset-x-0 bottom-0 h-[clamp(11rem,28vw,17rem)] w-full" />
      </div>
    </section>
  )
}
