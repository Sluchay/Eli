import { Pinecone } from '@/components/brand/Ornament'
import { ButtonLink } from '@/components/ui/Button'
import { SITE } from '@/lib/site'

export function FinalCta() {
  return (
    <section className="grain-dark relative isolate overflow-hidden bg-forest-800 py-16 text-kraft-100 sm:py-20">
      <div className="container-page relative text-center">
        <Pinecone className="mx-auto h-10 w-auto text-brass-light" />
        <h2 className="mt-6 font-heading text-3xl sm:text-4xl">Приходите. Будем есть.</h2>
        <p className="mx-auto mt-5 max-w-md text-[1.0625rem] leading-relaxed text-kraft-200/85">
          Меню — на одной странице, бронь — по звонку за минуту.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <ButtonLink
            href="/menu"
            variant="light"
            size="lg"
            className="ring-1 ring-kraft-300/60 ring-offset-2 ring-offset-forest-800"
          >
            Смотреть меню
          </ButtonLink>
          <ButtonLink href={SITE.phoneHref} variant="onDark" size="lg">
            {SITE.phoneDisplay}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
