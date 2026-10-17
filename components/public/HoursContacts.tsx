import { ButtonLink } from '@/components/ui/Button'
import { ClockIcon, PhoneIcon, PinIcon } from '@/components/ui/icons'
import { Section, SectionHeading } from '@/components/ui/Section'
import { formatRange, getOpenStatus, getOpeningHours } from '@/lib/hours'
import { SITE } from '@/lib/site'

/**
 * Часы работы и контакты.
 *
 * Карта подключается кнопкой, а не встроенным iframe: встраивание карт тянет
 * сотни килобайт сторонних скриптов, тормозит первый экран и раскрывает
 * поведение гостя третьей стороне. Кнопка решает ту же задачу за один тап.
 */
export function HoursContacts() {
  const hours = getOpeningHours()
  const status = getOpenStatus()

  return (
    <Section id="contacts" size="lg">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow="Как мы работаем" title="Часы работы" />

          <div className="mt-6 inline-flex items-center gap-2 rounded-brand border border-kraft-300 bg-kraft-200/60 px-4 py-2">
            <ClockIcon className={`h-4 w-4 ${status.isOpen ? 'text-ok' : 'text-berry'}`} />
            <span className="text-sm font-medium text-ink">{status.message}</span>
          </div>

          <dl className="mt-8 divide-y divide-kraft-300/70 border-y border-kraft-300/70">
            {hours.map((day) => {
              const isToday = day.weekday === status.today.weekday
              return (
                <div
                  key={day.weekday}
                  className={`flex items-baseline justify-between gap-6 py-3 ${
                    isToday ? 'text-ink' : 'text-ink-soft'
                  }`}
                >
                  <dt className={isToday ? 'font-medium' : undefined}>
                    {day.label}
                    {isToday && (
                      <span className="ml-2 text-xs uppercase tracking-[0.14em] text-brass">
                        сегодня
                      </span>
                    )}
                  </dt>
                  <dd className="text-right">
                    <span className="tnum block">{formatRange(day)}</span>
                    {day.note && <span className="block text-xs text-ink-soft/80">{day.note}</span>}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>

        <div className="lg:pt-4">
          <SectionHeading eyebrow="Контакты" title="Найти нас" />

          <dl className="mt-8 space-y-6">
            <div className="flex gap-4">
              <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-ink-soft">Адрес</dt>
                <dd className="mt-1 text-[1.0625rem] text-ink">{SITE.addressFull}</dd>
              </div>
            </div>

            <div className="flex gap-4">
              <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-ink-soft">Телефон</dt>
                <dd className="mt-1">
                  <a
                    href={SITE.phoneHref}
                    className="tnum text-[1.0625rem] text-ink underline decoration-kraft-400 underline-offset-4 transition-colors hover:text-forest-700"
                  >
                    {SITE.phoneDisplay}
                  </a>
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={SITE.routeUrl} variant="primary">
              Построить маршрут
            </ButtonLink>
            <ButtonLink href={SITE.phoneHref} variant="outline">
              Позвонить
            </ButtonLink>
          </div>

          {/* Прежняя приписка про парковку во дворе и вход с торца была
              демо-текстом и для ресторана на третьем этаже ТЦ прямо неверна.
              Вместо неё — то, что просил владелец: куда идти за подробностями. */}
          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            {SITE.contactNote}{' '}
            <a
              href={SITE.phoneHref}
              className="tnum text-ink underline decoration-kraft-400 underline-offset-4 transition-colors hover:text-forest-700"
            >
              {SITE.phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </Section>
  )
}
