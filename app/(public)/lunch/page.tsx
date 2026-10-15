import type { Metadata } from 'next'
import Link from 'next/link'
import { OrnamentDivider, Pinecone } from '@/components/brand/Ornament'
import { ButtonLink } from '@/components/ui/Button'
import { ClockIcon } from '@/components/ui/icons'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Бизнес-ланч',
  description:
    'Бизнес-ланч в ресторане ЕЛИ: суп, горячее и напиток по будням. Состав меняется каждый день.',
  alternates: { canonical: '/lunch' },
}

/**
 * Бизнес-ланч отдельной страницей.
 *
 * Специально сделано как афиша: короткие публикации «картинка + текст»,
 * которые владелец собирает копированием из соцсетей. Расписание подачи —
 * одна строка в настройках, а не сложная сетка по дням.
 */
export default async function LunchPage() {
  const [lunches, settings] = await Promise.all([
    prisma.businessLunch.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ])

  const note = settings?.lunchNote ?? 'понедельник – пятница, 12:00–16:00'

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Бизнес-ланч</p>
        <h1 className="mt-3 font-heading text-4xl text-forest-700 sm:text-5xl">Обед по-будничному</h1>
        <OrnamentDivider className="mt-6 max-w-xs" />

        <p className="mt-6 flex items-center gap-3 text-[1.0625rem] text-ink">
          <ClockIcon className="h-5 w-5 shrink-0 text-brass" />
          {note}
        </p>

        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">
          Быстро, сытно и без ожидания: ланч готовят заранее, поэтому приносят почти сразу.
        </p>
      </header>

      {lunches.length === 0 ? (
        <div className="mt-14 rounded-brand border border-dashed border-kraft-400 py-16 text-center">
          <Pinecone className="mx-auto h-10 w-auto text-kraft-400" />
          <p className="mt-5 font-heading text-xl text-forest-700">Ланч скоро появится</p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-ink-soft">
            Мы обновляем состав. Позвоните — расскажем, что есть сегодня.
          </p>
          <a href={SITE.phoneHref} className="mt-6 inline-block">
            {SITE.phoneDisplay}
          </a>
        </div>
      ) : (
        <ul className="mt-12 space-y-8">
          {lunches.map((lunch) => {
            const price = formatPrice(lunch.price)

            return (
              <li
                key={lunch.id}
                className="overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/50 sm:flex"
              >
                {lunch.imagePath && (
                  // Фото уже сжато и переведено в WebP при загрузке через админку.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lunch.imagePath}
                    alt={lunch.title}
                    loading="lazy"
                    className="h-56 w-full object-cover sm:h-auto sm:w-2/5"
                  />
                )}

                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h2 className="font-heading text-2xl text-forest-700">{lunch.title}</h2>

                  {lunch.description && (
                    <p className="mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-soft">
                      {lunch.description}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                    <p className="price text-2xl text-brass">
                      {price ?? lunch.priceNote ?? 'цену уточняйте'}
                    </p>

                    <ButtonLink href={SITE.phoneHref} variant="outline">
                      Забронировать стол
                    </ButtonLink>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-kraft-300/70 pt-8">
        <p className="max-w-md text-sm text-ink-soft">
          Полное меню — на отдельной странице. Там же состав, аллергены и калорийность.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/menu" variant="primary">
            Смотреть меню
          </ButtonLink>
          <Link
            href="/#contacts"
            className="inline-flex min-h-11 items-center text-[0.75rem] uppercase tracking-[0.1em] text-ink-soft underline decoration-kraft-400 underline-offset-4 transition-colors hover:text-forest-700"
          >
            Как нас найти
          </Link>
        </div>
      </div>
    </div>
  )
}
