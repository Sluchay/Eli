import { saveLunchNoteAction } from '@/app/admin/actions'
import { deleteLunchAction } from '@/app/admin/actions'
import { LunchForm, type LunchFormData } from '@/components/admin/LunchForm'
import { cardClass, inputClass, labelClass, Notice, toDateInput } from '@/components/admin/ui'
import { buttonClass } from '@/components/ui/Button'
import { prisma } from '@/lib/db'
import { kopecksToInput } from '@/lib/money'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Бизнес-ланч — админка' }

export default async function AdminLunchPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const params = await searchParams

  const [lunches, settings] = await Promise.all([
    prisma.businessLunch.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ])

  return (
    <>
      <h1 className="font-heading text-3xl text-forest-700">Бизнес-ланч</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Публикуется на отдельной странице <span className="text-ink">/lunch</span>. Достаточно
        картинки и пары строк — можно скопировать анонс из соцсетей и вставить как есть.
      </p>

      {params.ok && <Notice>Сохранено. На сайте уже видно.</Notice>}

      <section className={`${cardClass} mt-8`}>
        <h2 className="font-heading text-xl text-forest-700">Когда подаём</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Эта строка показывается на странице ланча крупно, под заголовком.
        </p>

        <form action={saveLunchNoteAction} className="mt-5 space-y-4">
          <label className="block">
            <span className={labelClass}>Надпись про время</span>
            <input
              name="lunchNote"
              defaultValue={settings?.lunchNote ?? 'понедельник – пятница, 12:00–16:00'}
              className={inputClass}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="lunchEnabled"
              defaultChecked={settings?.lunchEnabled ?? true}
              className="h-4 w-4 accent-[#1f3a2c]"
            />
            <span className="text-sm text-ink">Показывать раздел «Бизнес-ланч» в меню сайта</span>
          </label>

          <button type="submit" className={buttonClass('primary')}>
            Сохранить
          </button>
        </form>
      </section>

      <details className={`${cardClass} mt-6`}>
        <summary className="cursor-pointer text-sm font-medium text-forest-700">
          Добавить ланч
        </summary>
        <div className="mt-5">
          <LunchForm />
        </div>
      </details>

      <div className="mt-8 space-y-6">
        {lunches.map((lunch) => {
          const data: LunchFormData = {
            id: lunch.id,
            title: lunch.title,
            description: lunch.description,
            price: kopecksToInput(lunch.price),
            priceNote: lunch.priceNote,
            image: lunch.imagePath
              ? { path: lunch.imagePath, width: 0, height: 0 }
              : null,
            validFrom: toDateInput(lunch.validFrom),
            validTo: toDateInput(lunch.validTo),
            isPublished: lunch.isPublished,
            sortOrder: String(lunch.sortOrder),
          }

          return (
            <section key={lunch.id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-heading text-xl text-forest-700">{lunch.title}</h2>
                  <p className="mt-1 text-xs text-ink-soft">
                    {lunch.isPublished ? 'опубликован' : 'черновик — гость не видит'}
                    {lunch.price ? ` · ${kopecksToInput(lunch.price)} ₽` : ''}
                  </p>
                </div>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                  Редактировать
                </summary>
                <div className="mt-5">
                  <LunchForm lunch={data} />
                </div>
              </details>

              <form action={deleteLunchAction} className="mt-5 border-t border-kraft-300/70 pt-4">
                <input type="hidden" name="id" value={lunch.id} />
                <button
                  type="submit"
                  className="text-[0.6875rem] uppercase tracking-[0.1em] text-berry transition-colors hover:text-ink"
                >
                  Удалить
                </button>
              </form>
            </section>
          )
        })}

        {lunches.length === 0 && (
          <p className="text-sm text-ink-soft">
            Пока ничего не опубликовано. Нажмите «Добавить ланч» — страница /lunch появится на сайте.
          </p>
        )}
      </div>
    </>
  )
}
