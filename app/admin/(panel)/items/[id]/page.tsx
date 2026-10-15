import { notFound } from 'next/navigation'
import { ItemForm, type ItemFormValues } from '@/components/admin/ItemForm'
import { Notice } from '@/components/admin/ui'
import { prisma } from '@/lib/db'
import { parseCodeList } from '@/lib/menu'
import { kopecksToInput } from '@/lib/money'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Блюдо — админка' }

/**
 * Одна страница на создание и правку блюда: /admin/items/new или /admin/items/<id>.
 * Разделять их смысла нет — форма одна и та же.
 */
export default async function AdminItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ok?: string; error?: string; section?: string }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const isNew = id === 'new'

  const sections = await prisma.menuSection.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, title: true, iconKey: true },
  })

  if (sections.length === 0) {
    return (
      <>
        <h1 className="font-heading text-3xl text-forest-700">Сначала нужен раздел</h1>
        <p className="mt-3 max-w-xl text-sm text-ink-soft">
          Блюдо живёт внутри раздела меню. Создайте раздел — например, «Салаты» — и вернитесь сюда.
        </p>
      </>
    )
  }

  const item = isNew
    ? null
    : await prisma.menuItem.findUnique({
        where: { id },
        include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] } },
      })

  if (!isNew && !item) notFound()

  const defaultSectionId =
    (query.section && sections.some((section) => section.id === query.section)
      ? query.section
      : sections[0]?.id) ?? ''

  const primaryImage = item?.images[0] ?? null

  const values: ItemFormValues = item
    ? {
        id: item.id,
        sectionId: item.sectionId,
        name: item.name,
        description: item.description ?? '',
        price: kopecksToInput(item.price),
        priceNote: item.priceNote ?? '',
        weight: item.weight ?? '',
        volume: item.volume ?? '',
        composition: item.composition ?? '',
        allergens: parseCodeList(item.allergens),
        calories: item.calories === null ? '' : String(item.calories),
        protein: item.protein === null ? '' : String(item.protein),
        fat: item.fat === null ? '' : String(item.fat),
        carbs: item.carbs === null ? '' : String(item.carbs),
        badges: parseCodeList(item.badges),
        isVisible: item.isVisible,
        isStopList: item.isStopList,
        sortOrder: String(item.sortOrder),
        image: primaryImage
          ? { path: primaryImage.path, width: primaryImage.width, height: primaryImage.height }
          : null,
      }
    : {
        id: null,
        sectionId: defaultSectionId,
        name: '',
        description: '',
        price: '',
        priceNote: '',
        weight: '',
        volume: '',
        composition: '',
        allergens: [],
        calories: '',
        protein: '',
        fat: '',
        carbs: '',
        badges: [],
        isVisible: true,
        isStopList: false,
        sortOrder: '0',
        image: null,
      }

  return (
    <>
      <h1 className="font-heading text-3xl text-forest-700">
        {isNew ? 'Новое блюдо' : item?.name}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Справа карточка обновляется по мере ввода — видно, что получит гость.
      </p>

      {query.ok && <Notice>Сохранено. На сайте уже видно.</Notice>}
      {query.error === 'required' && (
        <Notice tone="error">Нужно заполнить название и выбрать раздел.</Notice>
      )}

      <ItemForm
        values={values}
        sections={sections.map((section) => ({
          id: section.id,
          title: section.title,
          iconKey: section.iconKey ?? 'starter',
        }))}
      />
    </>
  )
}
