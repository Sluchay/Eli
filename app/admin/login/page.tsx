import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { loginAction } from '@/app/admin/actions'
import { Logo } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'
import { getSessionUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Вход в админку',
  robots: { index: false, follow: false },
}

const FIELD =
  'mt-1.5 min-h-11 w-full rounded-brand border border-kraft-300 bg-white/70 px-3 py-2 text-ink focus:border-brass focus:outline-none'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>
}) {
  const user = await getSessionUser()
  if (user) redirect('/admin/menu')

  const params = await searchParams
  const hasError = params.error === '1'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-forest-900 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo tone="light" />
        </div>

        <div className="mt-8 rounded-brand border border-kraft-300 bg-kraft-100 p-6 sm:p-8">
          <h1 className="font-heading text-2xl text-forest-700">Вход в админку</h1>
          <p className="mt-2 text-sm text-ink-soft">Меню, бизнес-ланч и афиша ресторана.</p>

          {hasError && (
            <p
              role="alert"
              className="mt-5 rounded-brand border border-berry/40 bg-berry/10 px-3 py-2 text-sm text-berry"
            >
              Неверный e-mail или пароль.
            </p>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                defaultValue={params.email ?? ''}
                className={FIELD}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft"
              >
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={FIELD}
              />
            </div>

            <button type="submit" className={`${buttonClass('primary', 'lg')} w-full`}>
              Войти
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-kraft-300">
          <Link href="/" className="underline decoration-kraft-400 underline-offset-4 hover:text-kraft-100">
            Вернуться на сайт
          </Link>
        </p>
      </div>
    </div>
  )
}
