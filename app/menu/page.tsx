import type { Metadata } from 'next'
import { OrnamentDivider } from '@/components/brand/Ornament'
import { MenuBrowser } from '@/components/public/menu/MenuBrowser'
import { buttonClass } from '@/components/ui/Button'
import { getOpenStatus } from '@/lib/hours'
import { getMenu } from '@/lib/menu'
import { SITE } from '@/lib/site'

/**
 * Меню рендерится динамически: правка в админке должна быть видна гостю сразу,
 * без пересборки сайта. Для SQLite и одного ресторана это доли миллисекунды.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Меню',
  description:
    'Меню ресторана ЕЛИ: закуски, салаты, супы, пицца, паста, горячее, гарниры, десерты, напитки и бар. Все разделы на одной странице, с составом и аллергенами.',
  alternates: { canonical: '/menu' },
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const [sections, params] = await Promise.all([getMenu(), searchParams])

  // ?t=<номер стола> — сюда ведёт QR-код со стола
  const parsed = Number.parseInt(params.t ?? '', 10)
  const tableNumber = Number.isFinite(parsed) && parsed > 0 && parsed < 1000 ? parsed : null
  const status = getOpenStatus()

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        {tableNumber !== null && (
          <p className="mb-5 inline-flex items-center gap-2 rounded-brand border border-brass/40 bg-brass/10 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brass">
            {`Стол №${tableNumber}`}
          </p>
        )}

        <p className="eyebrow">Меню</p>
        <h1 className="mt-3 font-heading text-4xl text-forest-700 sm:text-5xl">Что у нас едят</h1>
        <OrnamentDivider className="mt-6 max-w-xs" />

        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
          Все разделы на одной странице: листайте вниз или выберите раздел в ленте. Состав, аллергены
          и КБЖУ прячутся за кнопкой «Подробнее», чтобы меню читалось, а не изучалось.
        </p>

        <p className="mt-5 text-sm text-ink-soft">
          {status.message} · {SITE.addressShort} ·{' '}
          <a
            href={SITE.phoneHref}
            className="tnum underline decoration-kraft-400 underline-offset-4 transition-colors hover:text-forest-700"
          >
            {SITE.phoneDisplay}
          </a>
        </p>
      </header>

      {sections.length === 0 ? (
        <div className="mt-14 rounded-brand border border-dashed border-kraft-400 py-16 text-center">
          <p className="font-heading text-2xl text-forest-700">Меню обновляется</p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-ink-soft">
            Мы как раз переписываем меню. Позвоните — расскажем, что есть сегодня.
          </p>
          <a href={SITE.phoneHref} className={`${buttonClass('primary')} mt-6`}>
            {SITE.phoneDisplay}
          </a>
        </div>
      ) : (
        <MenuBrowser sections={sections} />
      )}
    </div>
  )
}
