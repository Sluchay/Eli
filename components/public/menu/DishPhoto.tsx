'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CloseIcon, ExpandIcon } from '@/components/ui/icons'
import { formatPrice } from '@/lib/format'

/**
 * Увеличение фото блюда по нажатию.
 *
 * Зачем: карточка в две колонки на телефоне — это примерно 145 px ширины,
 * и блюдо по такому фото не разглядеть. Гость должен иметь возможность
 * ткнуть в него и увидеть нормальный кадр, а потом вернуться к тому же месту
 * меню — не потеряв, где он был.
 *
 * Почему встроенный <dialog>, а не своя модалка на div-ах:
 *  - Escape, фокус внутри окна, фон, возврат фокуса на картинку — браузер
 *    делает это сам, и делает правильно (свою ловушку фокуса легко сломать);
 *  - остальной сайт остаётся доступным для чтения скринридером;
 *  - нет библиотеки ради одного окна.
 *
 * Возврат к просмотру — тремя способами: крестик, Escape и нажатие по фону.
 * Прокрутка страницы за окном не уезжает: она блокируется, пока окно открыто.
 */

type Props = {
  /** Путь к фото в хранилище */
  src: string
  alt: string
  /** Название блюда — показывается под кадром */
  name: string
  /** Цена в копейках: null означает «цена по запросу» */
  price: number | null
  priceNote: string | null
  /** Пропорции фото, чтобы окно заняло ровно нужное место */
  ratioStyle: React.CSSProperties | undefined
  /** Текст подсказки для кнопки */
  label: string
}

export function DishPhoto({ src, alt, name, price, priceNote, ratioStyle, label }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => dialogRef.current?.close(), [])

  /* Состояние окна держим в React, а не только в DOM: от него зависит
     и блокировка прокрутки, и подсветка кнопки. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const onClose = () => setIsOpen(false)
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  /* Прокрутка страницы за открытым окном не должна уезжать */
  useEffect(() => {
    if (!isOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  const open = () => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.showModal === 'function') {
      dialog.showModal()
      setIsOpen(true)
    }
  }

  const formattedPrice = formatPrice(price)

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={label}
        className="group/photo relative block h-full w-full cursor-zoom-in"
      >
        {/* Фото уже сжато и переведено в WebP при загрузке через админку,
            поэтому здесь обычный img: оптимизировать повторно нечего. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Подсказка «можно увеличить»: видна всегда на телефоне (там нет
            наведения) и подсвечивается при наведении на большом экране. */}
        <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-brand bg-forest-900/70 text-kraft-100 opacity-90 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover/photo:opacity-100 sm:group-focus-visible/photo:opacity-100">
          <ExpandIcon className="h-4 w-4" />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Фотография блюда «${name}»`}
        onClick={(event) => {
          // Клик по фону закрывает. Клик по содержимому — нет.
          if (event.target === dialogRef.current) close()
        }}
        className="dish-lightbox m-auto max-h-[92dvh] w-auto max-w-[min(46rem,94vw)] rounded-brand border border-kraft-400 bg-kraft-100 p-0 text-ink open:block"
      >
        <div className="flex max-h-[92dvh] flex-col">
          <div
            className="relative w-full overflow-hidden bg-forest-900/5"
            style={{ ...ratioStyle, maxHeight: '76dvh' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="h-full w-full object-contain" />
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-kraft-300/70 p-4">
            <div className="min-w-0">
              <p className="font-heading text-lg text-forest-700">{name}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {formattedPrice ?? priceNote ?? 'цена по запросу'}
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Закрыть фотографию"
              className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-brand text-ink-soft transition-colors hover:bg-kraft-200 hover:text-forest-700"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
