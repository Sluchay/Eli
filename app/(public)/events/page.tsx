import type { Metadata } from 'next'
import Link from 'next/link'
import { OrnamentDivider, Pinecone } from '@/components/brand/Ornament'
import { buttonClass } from '@/components/ui/Button'
import { ClockIcon, MusicIcon } from '@/components/ui/icons'
import { prisma } from '@/lib/db'
import { formatEventDateTime, formatPrice, humanDayDelta } from '@/lib/format'
import { getOpenStatus } from '@/lib/hours'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Афиша',
  description:
    'Вечера живой музыки, дегустации и праздники в ресторане ЕЛИ. Что будет в ближайшее время и как забронировать стол.',
  alternates: { canonical: '/events' },
}

/**
 * Афиша — одна лента, без деления на разделы.
 *
 * Раньше страница делилась на «Ближайшие события» и «Анонсы», и гость должен
 * был сам соображать, чем они отличаются. По сути это одно и то же: карточка
 * с фото и подписью. Отличается только одно — есть ли у вечера конкретная
 * дата. Поэтому дата не создаёт раздел, а просто стоит в карточке там, где
 * она есть.
 *
 * Порядок задаёт владелец через поле «Порядок» в админке.
 *
 * ── Про вертикальные фото ─────────────────────────────────────────────────
 *
 * Афиша обычно рисуется для соцсетей, а там кадр вертикальный. Поэтому:
 *  1. Кадр хранится и показывается ОДИН — тот же файл, что ушёл в соцсети;
 *  2. на телефоне кадр занимает всю ширину карточки и виден целиком;
 *  3. на широком экране он встаёт колонкой рядом с текстом, чтобы не
 *     растягивать карточку на пол-экрана;
 *  4. пропорции берутся из размеров файла, сохранённых при загрузке, поэтому
 *     страница не «прыгает», пока картинка грузится.
 */

/** «9 февраля» — короткая дата для мелкой подписи */
function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: process.env.TZ ?? 'Europe/Moscow',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const status = getOpenStatus()

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Афиша</p>
        <h1 className="mt-3 font-heading text-4xl text-forest-700 sm:text-5xl">Что у нас будет</h1>
        <OrnamentDivider className="mt-6 max-w-xs" />
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
          Живая музыка, саксофон по вечерам, праздники и большие столы. На такие вечера зал
          заполняется заранее — позвоните, и мы оставим вам место.
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
        <ul className="mt-10 space-y-8 sm:space-y-10">
          {events.map((event) => {
            const price = formatPrice(event.price)
            const bookingHref = event.bookingPhone
              ? `tel:${event.bookingPhone.replace(/[^\d+]/g, '')}`
              : SITE.phoneHref

            return (
              <li
                key={event.id}
                className="grain relative overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/50"
              >
                {/* На телефоне фото сверху, текст под ним. С 640 px фото
                    встаёт колонкой рядом с текстом: так вертикальный кадр
                    ограничен шириной колонки, а не всей карточкой.
                    Отступы у текста свои (не у сетки), а фото выходит к краю
                    карточки — иначе вокруг него появляется светлая рамка.
                    Текст прижат к верху: постер бывает очень высоким, и без
                    этого справа остаётся пустое поле на пол-карточки. */}
                <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-start">
                  {event.imagePath && (
                    // Афишу показываем ЦЕЛИКОМ и на телефоне, и на большом
                    // экране. Это не фото блюда, которое можно подрезать:
                    // в постере уже напечатаны название, дата и время, и
                    // любая обрезка съедает именно их. Поэтому рамка не задаёт
                    // высоту — её определяет сам кадр.
                    <div className="relative overflow-hidden bg-kraft-300/40 sm:self-start">
                      {/* Фото уже сжато и переведено в WebP при загрузке,
                          поэтому обычный img здесь честнее оптимизатора. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.imagePath}
                        alt={event.title ?? 'Афиша ресторана ЕЛИ'}
                        loading="lazy"
                        decoding="async"
                        width={event.imageWidth ?? undefined}
                        height={event.imageHeight ?? undefined}
                        className="block h-auto w-full"
                      />
                    </div>
                  )}

                  <div className="flex flex-col px-6 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
                    {/* Дата — только если она есть. Это единственное, что
                        отличает «событие» от «анонса», и отдельного раздела
                        для этого не нужно. */}
                    {event.startsAt && (
                      <p className="flex flex-wrap items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brass">
                        <span className="tnum">{formatEventDateTime(event.startsAt)}</span>
                        <span className="text-ink-soft/70">{humanDayDelta(event.startsAt)}</span>
                      </p>
                    )}

                    {event.title && (
                      <h2 className="mt-3 font-heading text-2xl text-forest-700 sm:text-3xl">
                        {event.title}
                      </h2>
                    )}

                    {event.description && (
                      <p className="mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-soft">
                        {event.description}
                      </p>
                    )}

                    {(price || event.priceNote) && (
                      <p className="mt-4 flex items-center gap-2 text-sm text-ink">
                        <ClockIcon className="h-4 w-4 text-brass" />
                        {price ?? event.priceNote}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
                      <a href={bookingHref} className={buttonClass('primary')}>
                        Забронировать
                      </a>

                      {!event.startsAt && (
                        <span className="tnum text-xs text-ink-soft/70">
                          {formatShortDate(event.updatedAt)}
                        </span>
                      )}
                    </div>
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
