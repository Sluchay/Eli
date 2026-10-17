import Link from 'next/link'
import { toggleItemFlagAction } from '@/app/admin/actions'
import { SectionForm } from '@/components/admin/SectionForm'
import { cardClass, Notice, smallButtonClass } from '@/components/admin/ui'
import { buttonClass } from '@/components/ui/Button'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Меню — админка' }

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const params = await searchParams

  const sections = await prisma.menuSection.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      items: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: { images: true },
      },
    },
  })

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-forest-700">Меню</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Разделы и блюда. Цена вводится в рублях, как на бумажном меню. Изменения появляются на
            сайте сразу после сохранения.
          </p>
        </div>
        <Link href="/admin/items/new" className={buttonClass('primary', 'lg')}>
          Добавить блюдо
        </Link>
      </header>

      {params.ok && <Notice>Изменения сохранены.</Notice>}
      {params.error === 'required' && (
        <Notice tone="error">Нужно указать название блюда и раздел.</Notice>
      )}
      {params.error === 'section' && <Notice tone="error">У раздела должно быть название.</Notice>}

      <details className={`${cardClass} mt-8`}>
        <summary className="cursor-pointer text-sm font-medium text-forest-700">
          Добавить новый раздел
        </summary>
        <div className="mt-5">
          <SectionForm />
        </div>
      </details>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.id} className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-heading text-xl text-forest-700">
                  {section.title}
                  <span className="ml-2 font-body text-sm text-ink-soft">
                    {section.items.length} поз.
                  </span>
                </h2>
                {!section.isVisible && (
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-berry">
                    скрыт от гостей
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <details className="relative">
                  <summary className={`${smallButtonClass} cursor-pointer list-none`}>
                    Настройки раздела
                  </summary>
                  <div className="mt-4 rounded-brand border border-kraft-300 bg-kraft-200/50 p-4">
                    <SectionForm
                      section={{
                        id: section.id,
                        title: section.title,
                        description: section.description,
                        iconKey: section.iconKey,
                        availableFrom: section.availableFrom,
                        availableTo: section.availableTo,
                        sortOrder: section.sortOrder,
                        isVisible: section.isVisible,
                      }}
                    />
                  </div>
                </details>
              </div>
            </div>

            {section.items.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">
                В разделе пока нет блюд. Нажмите «Добавить блюдо» и выберите этот раздел.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-kraft-300/60 border-t border-kraft-300/60">
                {section.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-ink">{item.name}</p>
                      <p className="tnum mt-0.5 text-xs text-ink-soft">
                        {formatPrice(item.price) ?? 'цена не указана'}
                        {item.isStopList && ' · нет в наличии'}
                        {!item.isVisible && ' · скрыто'}
                        {item.images.length === 0 && ' · без фото'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <form action={toggleItemFlagAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="field" value="isStopList" />
                        <button
                          type="submit"
                          className={`${smallButtonClass} ${
                            item.isStopList ? 'border-berry/50 text-berry' : ''
                          }`}
                        >
                          {item.isStopList ? 'Вернуть в меню' : 'Нет в наличии'}
                        </button>
                      </form>

                      <Link href={`/admin/items/${item.id}`} className={smallButtonClass}>
                        Изменить
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {sections.length === 0 && (
          <p className="text-sm text-ink-soft">
            Разделов пока нет. Начните с «Добавить новый раздел» — например, «Салаты».
          </p>
        )}
      </div>
    </>
  )
}
