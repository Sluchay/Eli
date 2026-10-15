import Link from 'next/link'
import { logoutAction } from '@/app/admin/actions'
import { AdminNav } from '@/components/admin/AdminNav'
import { Logo } from '@/components/brand/Logo'
import { requireAdmin } from '@/lib/session'

/**
 * Каркас админки.
 *
 * Защита живёт здесь, а не в middleware: так проверка сессии выполняется
 * в обычном Node-окружении, где доступен node:crypto для подписи cookie.
 * Каждое серверное действие дополнительно проверяет сессию само.
 */
export const dynamic = 'force-dynamic'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <div className="flex min-h-dvh flex-col bg-kraft-200/40">
      <header className="bg-forest-900 text-kraft-100">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin/menu" aria-label="Админка ресторана ЕЛИ">
              <Logo tone="light" withSubtitle={false} />
            </Link>
            <span className="hidden text-[0.6875rem] uppercase tracking-[0.2em] text-moss-300 sm:inline">
              админка
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[0.6875rem] uppercase tracking-[0.14em] text-kraft-300 transition-colors hover:text-kraft-100"
            >
              На сайт
            </Link>
            <span className="hidden text-xs text-moss-300 md:inline">{user.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="min-h-11 text-[0.6875rem] uppercase tracking-[0.14em] text-kraft-300 transition-colors hover:text-kraft-100"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>

        <AdminNav />
      </header>

      <main className="container-page flex-1 py-6 sm:py-10">{children}</main>

      <footer className="container-page py-6 text-xs text-ink-soft">
        Вы вошли как {user.email}
      </footer>
    </div>
  )
}
