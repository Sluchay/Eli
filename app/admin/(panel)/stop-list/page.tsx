import { toggleItemFlagAction } from '@/app/admin/actions'
import { Notice } from '@/components/admin/ui'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Стоп-лист — админка' }

/**
 * Экран для работы во время смены.
 *
 * Сделан так, чтобы с телефона отмечать кончившееся блюдо одним касанием:
 * крупные кнопки, никаких подтверждений, никаких переходов на другие страницы.
 */
export default async function StopListPage() {
  const items = await prisma.menuItem.findMany({
    where: { isVisible: true },
    orderBy: [{ section: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    include: { section: { select: { title: true } } },
  })

  const stopCount = items.filter((item) => item.isStopList).length

  return (
    <>
      <h1 className="font-heading text-3xl text-forest-700">Стоп-лист</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Коснитесь блюда, которое кончилось. Гость увидит приглушённую карточку с плашкой «нет в
        наличии» — блюдо не исчезнет из меню, и никто не будет его заказывать.
      </p>

      <p className="mt-4 text-sm text-ink">
        Сейчас отмечено: <span className="tnum font-medium">{stopCount}</span> из {items.length}
      </p>

      {stopCount === 0 && (
        <Notice>Всё в наличии. Так и держать.</Notice>
      )}

      <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <form action={toggleItemFlagAction}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="field" value="isStopList" />
              <button
                type="submit"
                aria-pressed={item.isStopList}
                className={`flex min-h-16 w-full flex-col justify-center rounded-brand border px-4 py-3 text-left transition-colors ${
                  item.isStopList
                    ? 'border-berry/50 bg-berry/10'
                    : 'border-kraft-300 bg-kraft-100/70 hover:border-brass'
                }`}
              >
                <span className="text-sm leading-snug text-ink">{item.name}</span>
                <span className="mt-1 text-[0.6875rem] uppercase tracking-[0.12em] text-ink-soft">
                  {item.section.title}
                  {item.isStopList ? ' · нет в наличии — вернуть' : ''}
                </span>
              </button>
            </form>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="mt-8 text-sm text-ink-soft">
          В меню пока нет блюд. Добавьте их в разделе «Меню».
        </p>
      )}
    </>
  )
}
