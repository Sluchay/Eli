import { useId } from 'react'
import { spruceGeometry } from '@/lib/spruce'

/**
 * Орнаменты бренда: ель, лес по нижней кромке, шишка, разделитель.
 *
 * Всё нарисовано инлайн-SVG: ноль внешних файлов, ноль запросов,
 * масштабируется без потерь и красится currentColor. Это же означает, что
 * рисунок можно править кодом, а не перерисовывать картинку в редакторе.
 */

type SvgProps = { className?: string }

/** Одна ель силуэтом — как на афише ресторана */
export function Spruce({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 30" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .8 17.2 8h-3.1l4.4 7.2h-3.6l5 8.2h-6.5v4.4h-2.8v-4.4H4.1l5-8.2H5.5L9.9 8H6.8L12 .8Z" />
    </svg>
  )
}

/**
 * Силуэт ели в «афишной» манере: узкое тело, ветви-ярусы наклонно вниз,
 * кончики чуть отогнуты. На узкой ели это читается как хвоя, а не как
 * ступеньки из детского рисунка.
 *
 * Координаты нормированы: высота 100, ширина width. Верх — макушка, низ — земля.
 */
function coniferPath(seed: number, width: number): string {
  const w = width
  const cx = w / 2
  const tip = 3
  const ground = 100
  // Небольшой наклон ярусов: два дерева рядом не должны быть близнецами
  const lean = (seed % 3) - 1

  const parts: string[] = [`M ${cx + lean} ${tip}`]

  const tiers = [
    { y: 26, half: w * 0.16 },
    { y: 44, half: w * 0.24 },
    { y: 62, half: w * 0.33 },
    { y: 80, half: w * 0.42 },
    { y: 94, half: w * 0.5 },
  ]

  for (const tier of tiers) {
    const droop = 7 + lean * 1.5
    parts.push(`L ${cx + tier.half} ${tier.y + droop}`)
    parts.push(`L ${cx + tier.half * 0.62} ${tier.y - 1}`)
  }

  // Срез у земли: ствол виден между нижними ветвями
  parts.push(`L ${cx + w * 0.07} ${ground}`)
  parts.push(`L ${cx - w * 0.07} ${ground}`)

  for (const tier of [...tiers].reverse()) {
    const droop = 7 + lean * 1.5
    parts.push(`L ${cx - tier.half * 0.62} ${tier.y - 1}`)
    parts.push(`L ${cx - tier.half} ${tier.y + droop}`)
  }

  parts.push('Z')
  return parts.join(' ')
}

type Tree = { x: number; height: number; width: number; seed: number }

/**
 * Ряд деревьев. Позиции специально неровные: равномерный шаг выдаёт повтор,
 * а лес — это не забор.
 */
function treeRow(
  count: number,
  span: number,
  heightRange: [number, number],
  widthRatio: number,
  seedOffset: number,
): Tree[] {
  const trees: Tree[] = []
  const step = span / count

  for (let index = 0; index < count; index += 1) {
    const seed = (index * 37 + seedOffset * 11) % 97
    const jitter = (seed % 31) / 31 - 0.5
    const height = heightRange[0] + ((seed % 23) / 23) * (heightRange[1] - heightRange[0])

    trees.push({
      x: index * step + step / 2 + jitter * step * 0.55,
      height,
      width: height * widthRatio,
      seed,
    })
  }

  return trees
}

type ForestSceneProps = {
  className?: string
  /** Сколько деревьев в каждом ряду: на телефоне меньше и крупнее */
  density: 'wide' | 'narrow'
  /** Как вписывать рисунок в блок */
  fit: 'stretch' | 'crop'
}

const VIEW_W = 1600
const VIEW_H = 246

/**
 * Один лесной срез.
 *
 * Три ряда с разной высотой, цветом и прозрачностью дают глубину: дальний лес
 * светлее и мельче, ближний темнее и крупнее. Верхушки растворяются градиентом
 * (это край леса, а не ряд силуэтов), низ уходит в дымку маской.
 */
function ForestScene({ className, density, fit }: ForestSceneProps) {
  // useId обязателен: на странице два таких среза (для телефона и для
  // большого экрана), и без уникальных id градиенты перепутаются.
  const uid = useId().replace(/:/g, '')

  const ids = {
    back: `forest-back-${uid}`,
    middle: `forest-middle-${uid}`,
    front: `forest-front-${uid}`,
    ground: `forest-ground-${uid}`,
    mask: `forest-mask-${uid}`,
  }

  const isNarrow = density === 'narrow'

  // На телефоне деревьев меньше — они крупнее и читаются, а не слипаются.
  // Но и не реже: пустой горизонт выглядит как обрубленный лес.
  const back = treeRow(isNarrow ? 28 : 46, VIEW_W, isNarrow ? [78, 118] : [70, 118], 0.2, 5)
  const middle = treeRow(isNarrow ? 20 : 30, VIEW_W, isNarrow ? [112, 158] : [110, 168], 0.24, 13)
  const front = treeRow(isNarrow ? 13 : 19, VIEW_W, isNarrow ? [150, 196] : [150, 232], 0.3, 29)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      // stretch — рисунок тянется по ширине блока (пропорции полосы совпадают,
      // поэтому искажение небольшое). crop — пропорции сохраняются, лишнее
      // обрезается по краям: так на телефоне деревья остаются крупными.
      preserveAspectRatio={fit === 'crop' ? 'xMidYMax slice' : 'none'}
      aria-hidden="true"
      className={className}
    >
      <defs>
        {/* Лес полупрозрачный, а не залитый своим цветом.
            Раньше у деревьев был собственный плотный цвет, и на стыке с
            фоном героя появлялась граница: казалось, что это отдельная
            картинка, наложенная сверху. Теперь сквозь ветви видно общий
            фон, и лес читается как силуэт на нём.
            Заливки идут с fill-opacity, а не через opacity у path: иначе
            полупрозрачными стали бы и градиенты, и силуэт растворился бы. */}
        <linearGradient id={ids.back} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f1d16" stopOpacity="0" />
          <stop offset="58%" stopColor="#0f1d16" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0f1d16" stopOpacity="0.34" />
        </linearGradient>

        <linearGradient id={ids.middle} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f1d16" stopOpacity="0" />
          <stop offset="50%" stopColor="#0f1d16" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f1d16" stopOpacity="0.5" />
        </linearGradient>

        <linearGradient id={ids.front} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1710" stopOpacity="0" />
          <stop offset="45%" stopColor="#0b1710" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0b1710" stopOpacity="0.72" />
        </linearGradient>

        {/* Растворение у земли: низ деревьев уходит в дымку, а не обрубается */}
        <mask id={ids.mask}>
          <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="white" />
          <rect
            x="0"
            y={VIEW_H - 46}
            width={VIEW_W}
            height={46}
            fill={`url(#${ids.ground})`}
          />
        </mask>

        <linearGradient id={ids.ground} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g mask={`url(#${ids.mask})`}>
        <g>
          {back.map((tree) => (
            <path
              key={`b-${tree.x}`}
              fill={`url(#${ids.back})`}
              d={coniferPath(tree.seed, tree.width)}
              transform={`translate(${tree.x - tree.width / 2} ${VIEW_H - tree.height}) scale(${tree.height / 100})`}
            />
          ))}
        </g>

        <g>
          {middle.map((tree) => (
            <path
              key={`m-${tree.x}`}
              fill={`url(#${ids.middle})`}
              d={coniferPath(tree.seed + 3, tree.width)}
              transform={`translate(${tree.x - tree.width / 2} ${VIEW_H - tree.height}) scale(${tree.height / 100})`}
            />
          ))}
        </g>

        <g>
          {front.map((tree) => (
            <path
              key={`f-${tree.x}`}
              fill={`url(#${ids.front})`}
              d={coniferPath(tree.seed + 7, tree.width)}
              transform={`translate(${tree.x - tree.width / 2} ${VIEW_H - tree.height}) scale(${tree.height / 100})`}
            />
          ))}
        </g>
      </g>
    </svg>
  )
}

/**
 * Лес по нижней кромке — «уход в хвою» под первым экраном.
 *
 * Почему не одной линией, как было раньше:
 *  - прежний ряд рисовался в пропорции 224×48 и растягивался на всю ширину:
 *    на большом экране деревья сплющивало по горизонтали почти в шесть раз,
 *    и они выглядели игрушечными;
 *  - раньше был один плоский ряд одинаковых ёлок с шагом 28 px — повтор
 *    читался сразу;
 *  - теперь три ряда разной высоты и цвета дают глубину, позиции деревьев
 *    неровные, а на телефоне рисуется отдельный, более редкий вариант:
 *    иначе мелкие деревья сливаются в полосу.
 */
export function ForestEdge({ className }: SvgProps) {
  return (
    <div className={className} aria-hidden="true">
      {/* Телефон: крупные деревья, пропорции сохранены */}
      <ForestScene className="h-full w-full sm:hidden" density="narrow" fit="crop" />
      {/* Планшет и десктоп: полный лес на всю ширину */}
      <ForestScene className="hidden h-full w-full sm:block" density="wide" fit="stretch" />
    </div>
  )
}

/** Шишка — «точка» бренда, ставится в разделители и пустые состояния */
export function Pinecone({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 20 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 1.5c3.4 2.6 5.4 6.5 5.4 11.3 0 5.3-2.4 9.4-5.4 11.7-3-2.3-5.4-6.4-5.4-11.7C4.6 8 6.6 4.1 10 1.5Z" />
      <path d="M10 4.2v18.4M5.2 10.4c1.6 1 3 1.4 4.8 1.4s3.2-.4 4.8-1.4M4.8 15.6c1.7 1.1 3.3 1.6 5.2 1.6s3.5-.5 5.2-1.6M6.4 20.4c1.2.7 2.3 1 3.6 1s2.4-.3 3.6-1" />
    </svg>
  )
}

/** Разделитель секции: линейка — шишка — линейка */
export function OrnamentDivider({ className }: SvgProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`} aria-hidden="true">
      <span className="rule-brass flex-1" />
      <Pinecone className="h-4 w-auto text-brass" />
      <span className="rule-brass flex-1" />
    </div>
  )
}

const FOREST_VIEW_H = 54
const round2 = (value: number) => Math.round(value * 100) / 100

type ForestSceneProps2 = {
  className?: string
  density: 'wide' | 'narrow'
  /** Цвет гравировки: им же закрашивается фон за деревьями */
  engraveColor: string
}

/**
 * Ряд елей «как в логотипе».
 *
 * Форма деревьев одна с фирменным знаком — её считает `spruceGeometry`.
 * Отличие от `ForestScene` выше: там дальний лес растворяется в дымке,
 * а здесь это ровный ряд гравированных елей по кромке подвала — тот же
 * мотив, что в логотипе, и он не должен «тонуть» в градиенте.
 *
 * Пропорции подобраны под полосу 40–48 px высотой: если рисовать ряд в
 * «квадратном» viewBox, при растягивании на всю ширину ели расплющит.
 */
function LogoForestScene({ className, density, engraveColor }: ForestSceneProps2) {
  const isNarrow = density === 'narrow'
  const width = isNarrow ? 430 : 1600
  const count = isNarrow ? 10 : 36
  const step = width / count

  const trees = Array.from({ length: count }, (_, index) => {
    const seed = (index * 37 + 11) % 97
    // Неровный шаг: ровный выдаёт повтор, а лес — не забор
    const jitter = ((seed % 29) / 29 - 0.5) * 0.5
    const height = 32 + ((seed % 23) / 23) * 18
    return {
      key: index,
      x: index * step + step / 2 + jitter * step,
      height,
      width: height * 0.42,
      seed,
    }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${FOREST_VIEW_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      {trees.map((tree) => {
        const { body, engraving } = spruceGeometry(tree.height, tree.width, tree.seed)
        return (
          <g
            key={tree.key}
            transform={`translate(${round2(tree.x)} ${round2(FOREST_VIEW_H - tree.height)})`}
          >
            <path d={body} fill="currentColor" />
            {engraving.map((line, index) => (
              <path
                key={index}
                d={line}
                fill="none"
                strokeWidth={1.2}
                strokeLinecap="round"
                // Цвет через style, а не атрибутом: `stroke="var(--…)"` в
                // презентационном атрибуте поддерживают не все браузеры,
                // а в CSS-свойстве переменная работает везде.
                style={{ stroke: engraveColor }}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Лес по верхней кромке подвала — ёлки с логотипа.
 *
 * Раньше здесь был простой зигзаг в пропорции 224×48: на широком экране его
 * растягивало почти в шесть раз, и «лес» выглядел игрушечным. Теперь деревьев
 * больше, они разной высоты, и у каждого своя гравировка, как в знаке.
 *
 * Цвет гравировки по умолчанию равен фону, на котором стоит полоса: линии
 * должны не рисоваться поверх дерева, а «вырезать» его, как в логотипе.
 */
export function LogoForest({ className, engraveColor = 'var(--color-forest-800)' }: SvgProps & { engraveColor?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <LogoForestScene
        className="h-full w-full sm:hidden"
        density="narrow"
        engraveColor={engraveColor}
      />
      <LogoForestScene
        className="hidden h-full w-full sm:block"
        density="wide"
        engraveColor={engraveColor}
      />
    </div>
  )
}
