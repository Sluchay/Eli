'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Новая страница открывается с начала.
 *
 * Проблема, которую это лечит: в globals.css включена плавная прокрутка
 * (scroll-behavior: smooth) для якорных ссылок на главной. Chromium понимает
 * её буквально и начинает АНИМИРОВАТЬ даже сброс прокрутки при переходе на
 * другую страницу: анимация длится доли секунды, её обрывает момент, когда
 * новая страница отрисовалась, — и новая страница открывается не с первого
 * экрана, а с того места, где анимация успела остановиться (в замерах — 65 px).
 *
 * Решение: при смене пути прокручиваем в начало мгновенно, отключив плавность
 * только на этот вызов. Якорные ссылки вида /#contacts не трогаем: там
 * переход к разделу — это и есть нужное поведение.
 */
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Якорь в адресе — браузер сам прокрутит к нужному разделу
    if (window.location.hash) return

    const root = document.documentElement
    const previous = root.style.scrollBehavior

    // 'auto' отключает плавность ровно на время этого вызова
    root.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    root.style.scrollBehavior = previous
  }, [pathname])

  return null
}
