import Link from 'next/link'
import { MenuListIcon, PhoneIcon, PinIcon } from '@/components/ui/icons'
import { SITE } from '@/lib/site'

/**
 * Три действия, ради которых гость вообще открывает сайт локального ресторана:
 * посмотреть меню, позвонить, доехать. Всё — не выше первого экрана.
 */
export function QuickActions() {
  const actions = [
    {
      href: '/menu',
      title: 'Меню',
      description: 'Все разделы одной страницей',
      icon: <MenuListIcon className="h-6 w-6" />,
      external: false,
    },
    {
      href: SITE.phoneHref,
      title: 'Позвонить',
      description: SITE.phoneDisplay,
      icon: <PhoneIcon className="h-6 w-6" />,
      external: true,
    },
    {
      href: SITE.routeUrl,
      title: 'Как добраться',
      description: SITE.addressShort,
      icon: <PinIcon className="h-6 w-6" />,
      external: true,
    },
  ]

  return (
    <div className="border-b border-kraft-300/70 bg-kraft-200/60">
      <div className="container-page grid gap-px py-0 sm:grid-cols-3">
        {actions.map((action) => {
          const content = (
            <>
              <span className="text-brass transition-colors group-hover:text-forest-700">
                {action.icon}
              </span>
              <span className="mt-4 block font-heading text-xl text-forest-700">{action.title}</span>
              <span className="mt-1 block text-sm text-ink-soft">{action.description}</span>
            </>
          )

          const className =
            'group flex min-h-[7.5rem] flex-col justify-center border-kraft-300/70 px-1 py-7 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-1'

          return action.external ? (
            <a key={action.title} href={action.href} className={className}>
              {content}
            </a>
          ) : (
            <Link key={action.title} href={action.href} className={className}>
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
