import type { CSSProperties } from 'react'

/**
 * Как показывать кадр афиши.
 *
 * Фото приходит из соцсетей, и пропорции у него какие угодно: 4:5 в ленте
 * Instagram, 9:16 в сторис, 2:1 в вертикальной сторис «на весь экран».
 * Обрезать такой кадр нельзя — в него уже вписаны дата и текст. Поэтому
 * пропорции берутся из самого файла, а страница только резервирует место.
 *
 * Место резервируется до загрузки картинки — иначе на телефоне текст прыгает
 * вниз ровно в тот момент, когда гость начал читать. Ради этого размеры фото
 * и сохраняются в базе при загрузке (см. lib/upload.ts).
 *
 * Но у пропорций есть предел разумного. Кадр 1:2,17 (типичная вертикальная
 * сторис на весь экран) в одну колонку телефона — это 780 px высоты, а выше
 * снимают уже «на весь экран» 1:3. Такие кадры ограничиваются: лучше показать
 * 9:16 и мягко подрезать, чем заставить гостя прокручивать одно фото.
 * Всё, что попадает в границы, показывается целиком и без обрезки.
 */
export type ImageFrame = {
  /** Пропорции как есть, например «1179 / 2560». null — размеров нет. */
  ratio: string | null
  /** Кадр шире, чем выше. */
  isLandscape: boolean
  /** Пропорции кадра на сайте: ограничены разумными границами. */
  style: CSSProperties | undefined
  /** Тот же кадр без ограничений — для тех мест, где нужен настоящий формат. */
  naturalStyle: CSSProperties | undefined
  /** Пропорции маленького превью в админке: всегда ограничены. */
  thumbStyle: CSSProperties | undefined
}

/** Границы пропорций: ниже (выше кадр) и выше (шире кадр) — подрезаем. */
export type FrameLimits = {
  min: number
  max: number
}

/** Анонсы и события ведут себя по-разному — см. комментарии у констант. */
export const ANNOUNCE_LIMITS: FrameLimits = { min: 9 / 16, max: 3 / 2 }

/**
 * Событие с датой стоит в широкой карточке и должно оставаться обозримым:
 * кадр выше 2:3 превращает карточку в простыню, поэтому границы жёстче.
 */
export const EVENT_LIMITS: FrameLimits = { min: 2 / 3, max: 3 / 2 }

/** Высота превью в списке афиши админки, px. */
const THUMB_WIDTH = 80
const THUMB_TALL_HEIGHT = 120

/**
 * Пропорции кадра и style для окна увеличения.
 *
 * В самом окне кадр показывается целиком, поэтому берём настоящие пропорции
 * файла и только ограничиваем их разумными рамками: панорама 3:1 заняла бы
 * окно целиком по ширине, а кадр 1:3 — весь экран по высоте.
 *
 * @param width  ширина фото в пикселях
 * @param height высота фото в пикселях
 */
export function photoFrameStyle(
  width: number | null,
  height: number | null,
): CSSProperties | undefined {
  if (!width || !height || width <= 0 || height <= 0) return undefined

  const natural = width / height
  const limited = Math.min(3, Math.max(0.5, natural))

  return { aspectRatio: asCssRatio(limited) }
}

function clampRatio(ratio: number, limits: FrameLimits): number {
  return Math.min(limits.max, Math.max(limits.min, ratio))
}

function asCssRatio(value: number): string {
  return value.toFixed(3)
}

/**
 * @param width  ширина фото в пикселях (сохраняется при загрузке)
 * @param height высота фото в пикселях
 * @param limits границы пропорций; по умолчанию — как у анонсов
 */
export function imageFrame(
  width: number | null,
  height: number | null,
  limits: FrameLimits = ANNOUNCE_LIMITS,
): ImageFrame {
  if (!width || !height || width <= 0 || height <= 0) {
    // Размеров нет (старое фото или фото без метаданных): показываем кадр
    // в пропорциях ленты по умолчанию и ничего не обещаем про обрезку.
    return {
      ratio: null,
      isLandscape: false,
      style: undefined,
      naturalStyle: undefined,
      thumbStyle: undefined,
    }
  }

  const natural = height / width
  const clamped = clampRatio(natural, limits)
  const isLandscape = width > height

  return {
    ratio: `${width} / ${height}`,
    isLandscape,
    // Значение уходит в CSS-переменную --announce-ratio: саму рамку рисует
    // класс .announce-frame из globals.css.
    style: { '--announce-ratio': asCssRatio(clamped) } as CSSProperties,
    naturalStyle: { '--announce-ratio': asCssRatio(natural) } as CSSProperties,
    // В списке админки высокое превью заняло бы пол-экрана, поэтому вертикаль
    // подрезаем до 2:3: там важно видеть список, а не кадр целиком.
    thumbStyle: isLandscape
      ? { height: `${THUMB_WIDTH}px` }
      : {
          height: `${THUMB_TALL_HEIGHT}px`,
          aspectRatio: asCssRatio(clampRatio(natural, { min: 2 / 3, max: 1 })),
        },
  }
}
