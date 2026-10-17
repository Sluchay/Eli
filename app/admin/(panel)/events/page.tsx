import { deleteEventAction } from '@/app/admin/actions'
import { EventForm, type EventFormData } from '@/components/admin/EventForm'
import { cardClass, Notice, toDateTimeInput } from '@/components/admin/ui'
import { prisma } from '@/lib/db'
import { formatEventDateTime } from '@/lib/format'
import { imageFrame } from '@/lib/image-frame'
import { kopecksToInput } from '@/lib/money'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Афиша — админка' }

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const params = await searchParams

  const events = await prisma.event.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const dated = events.filter((event) => event.startsAt !== null)
  const posts = events.filter((event) => event.startsAt === null)

  function toFormData(event: (typeof events)[number]): EventFormData {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: toDateTimeInput(event.startsAt),
      price: kopecksToInput(event.price),
      priceNote: event.priceNote,
      bookingPhone: event.bookingPhone,
      image: event.imagePath
        ? { path: event.imagePath, width: event.imageWidth ?? 0, height: event.imageHeight ?? 0 }
        : null,
      isPublished: event.isPublished,
      sortOrder: String(event.sortOrder),
    }
  }

  return (
    <>
      <h1 className="font-heading text-3xl text-forest-700">Афиша</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Два формата в одном месте: <span className="text-ink">событие</span> с датой попадает в
        расписание, а <span className="text-ink">анонс</span> — это просто фото и подпись, как пост
        в соцсетях.
      </p>

      {params.ok && <Notice>Сохранено. На сайте уже видно.</Notice>}

      <details className={`${cardClass} mt-8`}>
        <summary className="cursor-pointer text-sm font-medium text-forest-700">
          Добавить публикацию
        </summary>
        <div className="mt-5">
          <EventForm />
        </div>
      </details>

      <section className="mt-10">
        <h2 className="font-heading text-2xl text-forest-700">
          События с датой <span className="font-body text-sm text-ink-soft">({dated.length})</span>
        </h2>

        <div className="mt-5 space-y-6">
          {dated.map((event) => (
            <div key={event.id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-heading text-xl text-forest-700">
                    {event.title ?? 'Без заголовка'}
                  </h3>
                  <p className="mt-1 text-xs text-ink-soft">
                    {event.startsAt ? formatEventDateTime(event.startsAt) : ''}
                    {event.isPublished ? '' : ' · черновик'}
                  </p>
                </div>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                  Редактировать
                </summary>
                <div className="mt-5">
                  <EventForm event={toFormData(event)} />
                </div>
              </details>

              <form action={deleteEventAction} className="mt-5 border-t border-kraft-300/70 pt-4">
                <input type="hidden" name="id" value={event.id} />
                <button
                  type="submit"
                  className="text-[0.6875rem] uppercase tracking-[0.1em] text-berry transition-colors hover:text-ink"
                >
                  Удалить
                </button>
              </form>
            </div>
          ))}

          {dated.length === 0 && (
            <p className="text-sm text-ink-soft">Событий с датой пока нет.</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl text-forest-700">
          Анонсы без даты <span className="font-body text-sm text-ink-soft">({posts.length})</span>
        </h2>

        <div className="mt-5 space-y-6">
          {posts.map((post) => {
            const frame = imageFrame(post.imageWidth, post.imageHeight)
            return (
              <div key={post.id} className={cardClass}>
                <div className="flex flex-wrap items-start gap-4">
                  {post.imagePath && (
                    // Анонс из соцсетей почти всегда вертикальный, поэтому превью
                    // показываем в его пропорциях, а не квадратом: так сразу видно,
                    // что именно уйдёт в ленту и как кадр ляжет на сайте.
                    <div
                      className="w-20 shrink-0 overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/60"
                      style={frame.thumbStyle}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.imagePath} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-lg text-forest-700">
                    {post.title ?? 'Анонс'}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                    {post.description ?? 'без текста'}
                  </p>
                  {!post.isPublished && (
                    <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.14em] text-berry">
                      черновик
                    </p>
                  )}
                </div>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                  Редактировать
                </summary>
                <div className="mt-5">
                  <EventForm event={toFormData(post)} />
                </div>
              </details>

              <form action={deleteEventAction} className="mt-5 border-t border-kraft-300/70 pt-4">
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  className="text-[0.6875rem] uppercase tracking-[0.1em] text-berry transition-colors hover:text-ink"
                >
                  Удалить
                </button>
              </form>
            </div>
            )
          })}

          {posts.length === 0 && (
            <p className="text-sm text-ink-soft">
              Анонсов пока нет. Вставьте фото и подпись из соцсетей — дата не нужна.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
