import { changePasswordAction, createUserAction, deleteUserAction } from '@/app/admin/user-actions'
import { cardClass, inputClass, labelClass, Notice } from '@/components/admin/ui'
import { buttonClass } from '@/components/ui/Button'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Доступы — админка' }

const ERROR_MESSAGES: Record<string, string> = {
  current: 'Текущий пароль указан неверно.',
  short: 'Пароль должен быть не короче 8 символов.',
  mismatch: 'Новые пароли не совпадают.',
  email: 'Похоже, это не e-mail.',
  exists: 'Пользователь с таким e-mail уже есть.',
  forbidden: 'Менять доступы может только администратор.',
  self: 'Нельзя удалить свою учётную запись — вы же в ней работаете.',
  lastadmin: 'Это последний администратор. Удалить его — остаться без входа в админку.',
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const currentUser = await requireAdmin()
  const params = await searchParams

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })

  const successMessage =
    params.ok === 'password'
      ? 'Пароль изменён. В следующий раз входите с новым.'
      : params.ok === 'created'
        ? 'Пользователь добавлен — передайте ему e-mail и пароль.'
        : params.ok === 'deleted'
          ? 'Пользователь удалён.'
          : null

  return (
    <>
      <h1 className="font-heading text-3xl text-forest-700">Доступы в админку</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Пароли хранятся в виде необратимого отпечатка: посмотреть чужой пароль нельзя, можно только
        задать новый.
      </p>

      {successMessage && <Notice>{successMessage}</Notice>}
      {params.error && (
        <Notice tone="error">{ERROR_MESSAGES[params.error] ?? 'Не получилось. Попробуйте ещё раз.'}</Notice>
      )}

      {currentUser.role !== 'ADMIN' && (
        <p className="mt-6 rounded-brand border border-kraft-400 bg-kraft-200/60 px-3 py-2 text-sm text-ink-soft">
          Вы вошли как редактор. Свой пароль сменить можно, а добавлять и удалять пользователей —
          только администратор.
        </p>
      )}

      <section className={`${cardClass} mt-8`}>
        <h2 className="font-heading text-xl text-forest-700">Сменить свой пароль</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Это стоит сделать сразу после первого входа, если пароль вам выдавали.
        </p>

        <form action={changePasswordAction} className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>Текущий пароль</span>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Новый пароль</span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Повторите новый</span>
            <input
              name="repeatPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-3">
            <button type="submit" className={buttonClass('primary')}>
              Сменить пароль
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl text-forest-700">Кто может войти</h2>

        <ul className="mt-5 divide-y divide-kraft-300/70 border-y border-kraft-300/70">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-ink">
                  {user.name || 'Без имени'}
                  {user.id === currentUser.id && (
                    <span className="ml-2 text-xs uppercase tracking-[0.14em] text-brass">это вы</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">{user.email}</p>
              </div>

              <span
                className={`rounded-brand border px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] ${
                  user.role === 'ADMIN'
                    ? 'border-forest-500/40 bg-forest-500/10 text-forest-500'
                    : 'border-kraft-400 text-ink-soft'
                }`}
              >
                {user.role === 'ADMIN' ? 'администратор' : 'редактор'}
              </span>

              {user.id !== currentUser.id ? (
                <form action={deleteUserAction}>
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="ml-2 text-[0.6875rem] uppercase tracking-[0.1em] text-berry transition-colors hover:text-ink"
                  >
                    Удалить
                  </button>
                </form>
              ) : (
                <span className="w-[4.5rem]" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>

        <p className="mt-4 max-w-2xl text-sm text-ink-soft">
          <span className="text-ink">Администратор</span> может всё, включая доступы.{' '}
          <span className="text-ink">Редактор</span> ведёт меню, ланч и афишу и может сменить свой
          пароль, но добавлять и удалять пользователей не может.
        </p>
      </section>

      <details className={`${cardClass} mt-8`}>
        <summary className="cursor-pointer text-sm font-medium text-forest-700">
          Добавить пользователя
        </summary>

        <form action={createUserAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>E-mail (он же логин) *</span>
            <input name="email" type="email" required className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Имя</span>
            <input name="name" placeholder="Управляющий Сергей" className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Пароль (не короче 8 символов) *</span>
            <input name="password" type="text" required minLength={8} className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Права</span>
            <select name="role" defaultValue="EDITOR" className={inputClass}>
              <option value="EDITOR">Редактор — только меню, ланч и афиша</option>
              <option value="ADMIN">Администратор — всё, включая доступы</option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <button type="submit" className={buttonClass('primary')}>
              Добавить
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-ink-soft">
          Пароль виден здесь как обычный текст — так его проще продиктовать человеку. После передачи
          попросите его сразу сменить пароль на этой же странице.
        </p>
      </details>
    </>
  )
}
