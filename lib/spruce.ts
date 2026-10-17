/**
 * Геометрия ели — общая для знака в шапке и леса в подвале.
 *
 * Почему отдельный модуль, а не JSX в компоненте: один и тот же контур нужен
 * в двух местах и в разном масштабе (32 px в логотипе и 100 px в подвале).
 * Дублировать формулу в двух компонентах — гарантированно развести их через
 * полгода: поправишь в одном, забудешь в другом.
 *
 * Координаты локальные: макушка в (0, 0), земля в (0, height), ствол по оси
 * x = 0. Компонент только переносит и красит — форму рисует эта функция.
 */

export type SpruceGeometry = {
  /** Контур дерева: замкнутый path, заливается цветом бренда */
  body: string
  /** Линии гравировки внутри контура — рисуются цветом фона, как в логотипе */
  engraving: string[]
}

/** Ярусы: доля высоты от макушки и доля полуширины на этом ярусе */
const TIER_Y = [0.22, 0.41, 0.6, 0.79, 0.93] as const
const TIER_HALF = [0.34, 0.53, 0.72, 0.88, 1] as const

/** Насколько ветвь возвращается к оси между ярусами. Меньше — зубчатей,
 *  больше — глаже. 0.62 даёт силуэт живой ели, а не ёлочную иконку. */
const RETURN_RATIO = 0.62

const round = (value: number) => Math.round(value * 100) / 100

export function spruceGeometry(height: number, width: number, seed = 0): SpruceGeometry {
  const half = width / 2
  /** Насколько кончик ветви опускается ниже яруса: без этого ель — ступеньки */
  const droop = height * 0.085
  const trunk = width * 0.05

  // Небольшой разнобой в ширине ярусов: два дерева рядом не должны быть
  // близнецами, иначе ряд читается как обои, а не как лес.
  const tiers = TIER_Y.map((ratio, index) => {
    const skew = 1 + (((seed + index * 7) % 5) - 2) * 0.035
    // ?? 1 — страховка от noUncheckedIndexedAccess: массивы одной длины
    return { x: half * (TIER_HALF[index] ?? 1) * skew, y: height * ratio }
  })

  const body: string[] = ['M 0 0']
  for (const tier of tiers) {
    body.push(`L ${round(tier.x)} ${round(tier.y + droop)}`)
    body.push(`L ${round(tier.x * RETURN_RATIO)} ${round(tier.y + droop * 0.24)}`)
  }
  // Ствол у земли: две точки по обе стороны оси, между нижними ветвями
  body.push(`L ${round(trunk)} ${round(height)}`)
  body.push(`L ${round(-trunk)} ${round(height)}`)
  for (const tier of [...tiers].reverse()) {
    body.push(`L ${round(-tier.x * RETURN_RATIO)} ${round(tier.y + droop * 0.24)}`)
    body.push(`L ${round(-tier.x)} ${round(tier.y + droop)}`)
  }
  body.push('Z')

  // Гравировка: короткие штрихи вдоль ветвей, по одному на ярус с каждой
  // стороны. У нижнего яруса пропускаем — там ствол, штрих пересечёт землю.
  const engraving: string[] = []
  for (const tier of tiers.slice(0, -1)) {
    engraving.push(
      `M ${round(tier.x * 0.12)} ${round(tier.y + droop * 0.18)} L ${round(tier.x * 0.68)} ${round(tier.y + droop * 0.9)}`,
    )
    engraving.push(
      `M ${round(-tier.x * 0.12)} ${round(tier.y + droop * 0.18)} L ${round(-tier.x * 0.68)} ${round(tier.y + droop * 0.9)}`,
    )
  }

  return { body: body.join(' '), engraving }
}
