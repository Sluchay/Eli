import type { Metadata } from 'next'
import { OrnamentDivider } from '@/components/brand/Ornament'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Как ресторан ЕЛИ обрабатывает персональные данные гостей.',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: true },
}

/**
 * ЗАГЛУШКА. Текст ниже — рабочий каркас под 152-ФЗ, его обязательно должен
 * проверить юрист владельца перед публикацией. В CONTENT-TODO.md отмечено,
 * что нужно уточнить у владельца: юрлицо, ИНН, адрес для обращений и
 * необходимость уведомления в Роскомнадзор.
 */
export default function PrivacyPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Документы</p>
        <h1 className="mt-3 font-heading text-4xl text-forest-700">
          Политика конфиденциальности
        </h1>
        <OrnamentDivider className="mt-6 max-w-xs" />
      </header>

      <div className="mt-10 max-w-3xl space-y-8 text-[0.9375rem] leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-heading text-xl text-forest-700">1. Общие положения</h2>
          <p className="mt-3">
            Настоящая политика описывает порядок обработки персональных данных посетителей сайта
            ресторана «{SITE.name}» (далее — Сайт) и действует в отношении всей информации, которую
            оператор может получить о пользователе во время использования Сайта.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-forest-700">2. Какие данные мы собираем</h2>
          <p className="mt-3">
            При заполнении формы бронирования стола: имя и номер телефона. Дополнительно, при
            добровольном указании, — комментарий к брони. Иные персональные данные Сайт не
            запрашивает.
          </p>
          <p className="mt-3">
            Автоматически могут обрабатываться обезличенные технические данные: тип устройства, факт
            открытия страницы меню по QR-коду, время обращения. Эти данные не позволяют установить
            личность и используются только для статистики.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-forest-700">3. Зачем мы их обрабатываем</h2>
          <p className="mt-3">
            Единственная цель — подтвердить бронирование стола и связаться с гостем по указанному
            телефону. Данные не передаются третьим лицам, не используются для рассылок и не
            продаются.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-forest-700">4. Согласие и его отзыв</h2>
          <p className="mt-3">
            Отправляя форму, пользователь подтверждает согласие на обработку персональных данных на
            условиях настоящей политики. Согласие можно отозвать в любой момент: позвоните по
            телефону{' '}
            <a
              href={SITE.phoneHref}
              className="tnum underline decoration-kraft-400 underline-offset-4"
            >
              {SITE.phoneDisplay}
            </a>{' '}
            или напишите на {SITE.email} — мы удалим данные в течение трёх рабочих дней.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-forest-700">5. Хранение и защита</h2>
          <p className="mt-3">
            Данные хранятся на сервере, расположенном на территории Российской Федерации, не дольше,
            чем это необходимо для целей обработки. Доступ к ним имеет только уполномоченный
            сотрудник ресторана.
          </p>
        </section>

        <p className="rounded-brand border border-dashed border-kraft-400 p-4 text-sm">
          Черновой текст. Перед публикацией подставьте полное наименование юридического лица, ИНН,
          ОГРН и адрес для обращений — они указаны в CONTENT-TODO.md.
        </p>
      </div>
    </div>
  )
}
