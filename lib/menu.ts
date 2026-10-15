import type { MenuItem, MenuItemImage, MenuSection } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Чтение меню из базы и приведение его к виду, удобному для вёрстки.
 *
 * Здесь же живут справочники меток и аллергенов. В базе хранятся коды,
 * человекочитаемые подписи — только на выводе: так их можно перевести
 * или переименовать, не трогая данные.
 */

type SectionWithItems = MenuSection & {
  items: (MenuItem & { images: MenuItemImage[] })[]
}

export type MenuItemView = {
  id: string
  name: string
  description: string | null
  price: number | null
  priceNote: string | null
  weight: string | null
  volume: string | null
  composition: string | null
  allergens: string[]
  nutrition: { kcal: number; protein: number; fat: number; carbs: number } | null
  badges: string[]
  isStopList: boolean
  image: { path: string; alt: string | null; width: number; height: number } | null
}

export type MenuSectionView = {
  id: string
  slug: string
  title: string
  description: string | null
  iconKey: string
  availableFrom: string | null
  availableTo: string | null
  items: MenuItemView[]
}

export type BadgeTone = 'hit' | 'new' | 'diet' | 'spicy' | 'local'

export const BADGES: Record<string, { label: string; tone: BadgeTone }> = {
  hit: { label: 'Хит', tone: 'hit' },
  new: { label: 'Новинка', tone: 'new' },
  vegan: { label: 'Веган', tone: 'diet' },
  spicy: { label: 'Острое', tone: 'spicy' },
  glutenfree: { label: 'Без глютена', tone: 'diet' },
  local: { label: 'Локальное', tone: 'local' },
}

/** Порядок чипов-фильтров в меню */
export const BADGE_FILTERS: { code: string; label: string }[] = [
  { code: 'hit', label: 'Хиты' },
  { code: 'new', label: 'Новинки' },
  { code: 'vegan', label: 'Веган' },
  { code: 'spicy', label: 'Острое' },
  { code: 'glutenfree', label: 'Без глютена' },
  { code: 'local', label: 'Локальное' },
]

export const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Глютен',
  milk: 'Молоко',
  egg: 'Яйцо',
  fish: 'Рыба',
  crustacean: 'Ракообразные',
  mollusc: 'Моллюски',
  nuts: 'Орехи',
  peanut: 'Арахис',
  soy: 'Соя',
  celery: 'Сельдерей',
  mustard: 'Горчица',
  sesame: 'Кунжут',
  sulphites: 'Сульфиты',
  lupin: 'Люпин',
}

export function parseCodeList(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

function toItemView(item: MenuItem & { images: MenuItemImage[] }): MenuItemView {
  const primary = item.images.find((image) => image.isPrimary) ?? item.images[0] ?? null
  const hasNutrition =
    item.calories !== null || item.protein !== null || item.fat !== null || item.carbs !== null

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    priceNote: item.priceNote,
    weight: item.weight,
    volume: item.volume,
    composition: item.composition,
    allergens: parseCodeList(item.allergens),
    nutrition: hasNutrition
      ? {
          kcal: item.calories ?? 0,
          protein: item.protein ?? 0,
          fat: item.fat ?? 0,
          carbs: item.carbs ?? 0,
        }
      : null,
    badges: parseCodeList(item.badges),
    isStopList: item.isStopList,
    image: primary
      ? { path: primary.path, alt: primary.alt, width: primary.width, height: primary.height }
      : null,
  }
}

function toSectionView(section: SectionWithItems): MenuSectionView {
  return {
    id: section.id,
    slug: section.slug,
    title: section.title,
    description: section.description,
    iconKey: section.iconKey ?? 'starter',
    availableFrom: section.availableFrom,
    availableTo: section.availableTo,
    items: section.items.map(toItemView),
  }
}

export async function getMenu(): Promise<MenuSectionView[]> {
  const sections = await prisma.menuSection.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      items: {
        where: { isVisible: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] } },
      },
    },
  })

  // Пустые разделы на сайте не показываем: гостю нечего там делать.
  return sections.map(toSectionView).filter((section) => section.items.length > 0)
}
