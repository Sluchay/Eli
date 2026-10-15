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

/**
 * Афиша в двух форматах.
 *
 * «События» — с датой и временем, попадают в расписание.
 * «Анонсы» — просто фото и подпись, как пост в соцсетях: их можно скопировать
 * из Telegram или ВКонтакте и вставить как есть, не придумывая дату.
 */
export default async function EventsPage() {
  const now = new Date()

  const [dated, posts] = await Promise.all([
    prisma.event.findMany({
      where: { isPublished: true, startsAt: { gte: now } },
      orderBy: [{ startsAt: 'asc' }],
    }),
    prisma.event.findMany({
      where: { isPublished: true, startsAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
  ])

  const status = getOpenStatus()
  const isEmpty = dated.length === 0 && posts.length === 0

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

      {isEmpty ? (
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
        <div className="mt-12 space-y-16">
          {dated.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl text-forest-700">Ближайшие события</h2>

              <ul className="mt-6 space-y-6">
                {dated.map((event) => {
                  const startsAt = event.startsAt
                  if (!startsAt) return null

                  const price = formatPrice(event.price)

                  return (
                    <li
                      key={event.id}
                      className="grain relative overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/50"
                    >
                      {event.imagePath && (
                        // Фото уже сжато и переведено в WebP при загрузке,
                        // поэтому обычный img здесь честнее оптимизатора.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.imagePath}
                          alt={event.title ?? 'Афиша ресторана ЕЛИ'}
                          loading="lazy"
                          className="h-52 w-full object-cover sm:h-64"
                        />
                      )}

                      <div className="p-6 sm:p-8">
                        <p className="flex flex-wrap items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brass">
                          <span className="tnum">{formatEventDateTime(startsAt)}</span>
                          <span className="text-ink-soft/70">{humanDayDelta(startsAt)}</span>
                        </p>

                        {event.title && (
                          <h3 className="mt-3 font-heading text-2xl text-forest-700 sm:text-3xl">
                            {event.title}
                          </h3>
                        )}

                        {event.description && (
                          <p className="mt-3 max-w-2xl whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-soft">
                            {event.description}
                          </p>
                        )}

                        {(price || event.priceNote) && (
                          <p className="mt-4 flex items-center gap-2 text-sm text-ink">
                            <ClockIcon className="h-4 w-4 text-brass" />
                            {price ?? capitalize(event.priceNote ?? '')}
                          </p>
                        )}

                        <div className="mt-6">
                          <a
                            href={
                              event.bookingPhone
                                ? `tel:${event.bookingPhone.replace(/[^\d+]/g, '')}`
                                : SITE.phoneHref
                            }
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
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl text-forest-700">Анонсы</h2>

              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className="flex flex-col overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/50"
                  >
                    {post.imagePath && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imagePath}
                        alt={post.title ?? 'Анонс ресторана ЕЛИ'}
                        loading="lazy"
                        className="h-52 w-full object-cover"
                      />
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      {post.title && (
                        <h3 className="font-heading text-lg text-forest-700">{post.title}</h3>
                      )}

                      {post.description && (
                        <p className="mt-2 whitespace-pre-line text-[0.875rem] leading-relaxed text-ink-soft">
                          {post.description}
                        </p>
                      )}

                      {post.priceNote && (
                        <p className="mt-4 text-[0.6875rem] uppercase tracking-[0.14em] text-brass">
                          {post.priceNote}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
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
