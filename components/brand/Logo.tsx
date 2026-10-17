import { Pinecone } from '@/components/brand/Ornament'
import { spruceGeometry } from '@/lib/spruce'

/**
 * Логотип «ЕЛИ».
 *
 * Знак с фирменного логотипа ресторана: три ели разной высоты на общей линии
 * земли. В исходнике они выгравированы светлым по чёрному — здесь та же форма,
 * но красками сайта: латунь на крафтовой бумаге, светлая латунь на тёмном.
 *
 * Гравировки в знаке нет намеренно. На 32 px, где он живёт в шапке, штрихи
 * превращаются в серую грязь: силуэт должен оставаться силуэтом. Гравировка
 * есть там, где её видно, — в лесу по кромке подвала (`LogoForest`).
 */

type LogoMarkProps = { className?: string }

/** Три ели: левая ниже, средняя выше всех, правая посередине */
const MARK_TREES = [
  { x: 17, height: 36, width: 18, seed: 3 },
  { x: 44, height: 50, width: 24, seed: 9 },
  { x: 71, height: 41, width: 20, seed: 5 },
].map((tree) => ({ ...tree, body: spruceGeometry(tree.height, tree.width, tree.seed).body }))

const MARK_GROUND = 62

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      // Рамка обрезана по рисунку, а не «с запасом»: иначе внутри своего
      // бокса знак выглядел вдвое мельче текста рядом и вся связка казалась
      // кривой — деревья висели в пустоте, не совпадая по высоте со словом.
      viewBox="2 10 84 57"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {MARK_TREES.map((tree) => (
        <path
          key={tree.x}
          d={tree.body}
          transform={`translate(${tree.x} ${MARK_GROUND - tree.height})`}
        />
      ))}
      {/* Линия земли: в логотипе она провисает и выходит за крайние ели */}
      <path
        d={`M6 ${MARK_GROUND + 1} Q44 ${MARK_GROUND + 4} 82 ${MARK_GROUND + 1}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </svg>
  )
}

type LogoProps = {
  className?: string
  /** Подпись «ресторан» под словом */
  withSubtitle?: boolean
  /** Цветовая схема: на крафте или на тёмном фоне */
  tone?: 'dark' | 'light'
}

/**
 * Горизонтальная связка для шапки: знак и слово в одну строку.
 *
 * Знак выше слова, но ровно на высоту всего текстового блока (слово + подпись),
 * поэтому пара читается как одна строка, а не как «картинка рядом с текстом».
 */
export function Logo({ className, withSubtitle = true, tone = 'dark' }: LogoProps) {
  const wordColor = tone === 'dark' ? 'text-forest-700' : 'text-kraft-100'
  const markColor = tone === 'dark' ? 'text-brass' : 'text-brass-light'
  const subColor = tone === 'dark' ? 'text-ink-soft' : 'text-kraft-300'
  // Без подписи текстовый блок — одна строка, и знак во всю его высоту выглядел
  // бы великаном (это важно в шапке админки): там он равен строке.
  const markSize = withSubtitle ? 'h-9 w-auto sm:h-10' : 'h-7 w-auto sm:h-8'

  return (
    <span className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark className={`${markSize} shrink-0 ${markColor}`} />
      <span className="flex flex-col justify-center">
        <span
          className={`font-heading text-[1.375rem] leading-none tracking-[0.26em] sm:text-2xl ${wordColor}`}
        >
          ЕЛИ
        </span>
        {withSubtitle && (
          <span
            className={`mt-1 font-body text-[0.5rem] font-medium uppercase leading-none tracking-[0.34em] ${subColor}`}
          >
            ресторан
          </span>
        )}
      </span>
    </span>
  )
}

/**
 * Вертикальная связка — как на самом логотипе: ели, слово, линейка с шишкой,
 * подпись. Ставится в подвале, где есть воздух по вертикали.
 *
 * Слово и линейка центрируются относительно друг друга, а не прижимаются
 * влево: в логотипе линейка шире слова, и при выравнивании по левому краю она
 * торчала бы вправо, снова давая ощущение кривой вёрстки.
 */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <div className={`flex w-fit flex-col items-center ${className ?? ''}`}>
      <LogoMark className="h-14 w-auto text-brass-light" />
      <p className="mt-3 font-heading text-[1.5rem] leading-none tracking-[0.32em] text-kraft-100">
        ЕЛИ
      </p>
      <div className="mt-3 flex w-[6.5rem] items-center gap-2" aria-hidden="true">
        <span className="h-px flex-1 bg-kraft-300/40" />
        <Pinecone className="h-3.5 w-auto shrink-0 text-brass" />
        <span className="h-px flex-1 bg-kraft-300/40" />
      </div>
      <p className="mt-3 font-body text-[0.625rem] tracking-[0.28em] text-moss-300">by Shavykin</p>
    </div>
  )
}
