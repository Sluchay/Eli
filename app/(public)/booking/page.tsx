import type { Metadata } from 'next'
import { OrnamentDivider } from '@/components/brand/Ornament'
import { ButtonLink } from '@/components/ui/Button'
import { ClockIcon, PhoneIcon } from '@/components/ui/icons'
import { formatRange, getOpenStatus, getOpeningHours } from '@/lib/hours'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Бронирование стола',
  description: `Забронировать стол в ресторане ЕЛИ. Телефон ${SITE.phoneDisplay}.`,
  alternates: { canonical: '/booking' },
}

/**
 * ЭТАП 7 заменит эту страницу формой брони: заявка будет сохраняться в базу
 * и падать в админку с уведомлением. Пока бронь идёт по телефону — это честно
 * и работает лучше, чем нерабочая форма. Раздел 13 ТЗ, этап 7.
 */
export default function BookingPage() {
  const status = getOpenStatus()
  const hours = getOpeningHours()

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Бронирование</p>
        <h1 className="mt-3 font-heading text-4xl text-forest-700 sm:text-5xl">
          Забронировать стол
        </h1>
        <OrnamentDivider className="mt-6 max-w-xs" />
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
          Позвоните — договоримся за минуту. Мы не берём предоплату и не требуем подтверждений по
          почте.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="rounded-brand border border-kraft-300 bg-kraft-200/50 p-6 sm:p-8">
          <p className="flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 shrink-0 text-brass" />
            <a
              href={SITE.phoneHref}
              className="tnum font-heading text-2xl text-forest-700 underline decoration-kraft-400 underline-offset-4 sm:text-3xl"
            >
              {SITE.phoneDisplay}
            </a>
          </p>

          <p className="mt-6 flex items-center gap-3 text-sm text-ink-soft">
            <ClockIcon className={`h-4 w-4 shrink-0 ${status.isOpen ? 'text-ok' : 'text-berry'}`} />
            {status.message}
          </p>

          <dl className="mt-8 space-y-2 border-t border-kraft-300/70 pt-6 text-sm">
            {hours.map((day) => (
              <div key={day.weekday} className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-soft">{day.label}</dt>
                <dd className="tnum text-ink">{formatRange(day)}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={SITE.phoneHref} variant="primary">
              Позвонить сейчас
            </ButtonLink>
            <ButtonLink href="/menu" variant="outline">
              Сначала посмотреть меню
            </ButtonLink>
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl text-forest-700">Что стоит сказать при звонке</h2>
          <ul className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-ink-soft">
            <li>
              <span className="font-medium text-ink">Дату и время.</span> В пятницу и субботу после
              19:00 зал заполняется полностью — звоните за день или раньше.
            </li>
            <li>
              <span className="font-medium text-ink">Число гостей.</span> Если вас больше восьми,
              предупредите: сдвинем столы заранее.
            </li>
            <li>
              <span className="font-medium text-ink">Пожелания.</span> Стол у окна, тихий угол,
              детский стул, место для коляски — всё решаемо, если знать заранее.
            </li>
            <li>
              <span className="font-medium text-ink">Аллергии.</span> Скажите о них сразу — подскажем,
              что безопасно, или попросим кухню приготовить иначе.
            </li>
          </ul>

          <p className="mt-8 rounded-brand border border-dashed border-kraft-400 p-4 text-sm text-ink-soft">
            Форма онлайн-брони появится на следующем этапе: заявка будет уходить прямо в админку, а
            вам придёт подтверждение. Сейчас быстрее позвонить.
          </p>
        </div>
      </div>
    </div>
  )
}
