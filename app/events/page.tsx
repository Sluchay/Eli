import type { Metadata } from 'next'
import Link from 'next/link'
import { OrnamentDivider, Pinecone } from '@/components/brand/Ornament'
import { buttonClass } from '@/components/ui/Button'
import { ClockIcon, MusicIcon } from '@/components/ui/icons'
import { prisma } from '@/lib/db'
import { capitalize, formatEventDateTime, formatPrice, humanDayDelta } from '@/lib/format'
import { getOpenStatus } from '@/lib/hours'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Афиша',
  description:
    'Вечера живой музыки, дегустации и праздники в ресторане ЕЛИ. Расписание ближайших мероприятий и бронь столов.',
  alternates: { canonical: '/events' },
}

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: 'asc' },
  })
  const status = getOpenStatus()

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Афиша</p>
        <h1 className="mt-3 font-heading text-4xl text-forest-700 sm:text-5xl">Что у нас будет</h1>
        <OrnamentDivider className="mt-6 max-w-xs" />
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
          Живая музыка, дегустации и большие столы. На такие вечера зал заполняется заранее — лучше
          позвонить и забронировать.
        </p>
        <p className="mt-5 text-sm text-ink-soft">
          {status.message} ·{' '}
          <a
            href={SITE.phoneHref}
            className="tnum underline decoration-kraft-400 underline-offset-4 transition-colors hover:text-forest-700"
          >
            {SITE.phoneDisplay}
          </a>
        </p>
      </header>

      {events.length === 0 ? (
        <div className="mt-14 rounded-brand border border-dashed border-kraft-400 py-16 text-center">
          <MusicIcon className="mx-auto h-8 w-8 text-kraft-400" />
          <p className="mt-5 font-heading text-xl text-forest-700">Пока ничего не объявлено</p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-ink-soft">
            Следите за афишей — а лучше позвоните, и мы расскажем, что готовим на ближайшие выходные.
          </p>
          <a href={SITE.phoneHref} className={`${buttonClass('primary')} mt-6`}>
            {SITE.phoneDisplay}
          </a>
        </div>
      ) : (
        <ul className="mt-12 space-y-6">
          {events.map((event) => {
            const price = formatPrice(event.price)
            return (
              <li
                key={event.id}
                className="grain relative overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/50 p-6 sm:p-8"
              >
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="flex flex-wrap items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brass">
                      <span className="tnum">{formatEventDateTime(event.startsAt)}</span>
                      <span className="text-ink-soft/70">{humanDayDelta(event.startsAt)}</span>
                    </p>

                    <h2 className="mt-3 font-heading text-2xl text-forest-700 sm:text-3xl">
                      {event.title}
                    </h2>

                    {event.description && (
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
                        {event.description}
                      </p>
                    )}

                    {(price || event.priceNote) && (
                      <p className="mt-4 flex items-center gap-2 text-sm text-ink">
                        <ClockIcon className="h-4 w-4 text-brass" />
                        {price ?? capitalize(event.priceNote ?? '')}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <a
                      href={event.bookingPhone ? `tel:${event.bookingPhone.replace(/[^\d+]/g, '')}` : SITE.phoneHref}
                      className={buttonClass('primary')}
                    >
                      Забронировать
                    </a>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-14 flex items-center gap-4">
        <Pinecone className="h-8 w-auto shrink-0 text-kraft-400" />
        <p className="text-sm text-ink-soft">
          Хотите отметить у нас день рождения или провести дегустацию?{' '}
          <Link href="/#contacts" className="underline decoration-kraft-400 underline-offset-4">
            Свяжитесь с нами
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
