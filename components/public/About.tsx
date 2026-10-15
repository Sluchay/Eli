import { Pinecone } from '@/components/brand/Ornament'
import { Section, SectionHeading } from '@/components/ui/Section'

/**
 * «О ресторане». Здесь сдержанно раскрывается игра слов названия —
 * она и есть позиционирование: ели (дерево) и ели (глагол).
 */
export function About() {
  return (
    <Section id="about" size="lg">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="О ресторане"
            title="Ель, лес и то, что мы ели"
            description="Небольшой зал с живыми пихтами, открытая кухня и меню, которое меняется вместе с сезоном. Мы готовим из того, что растёт и водится рядом: грибы, ягоды, речная рыба, дичь, печной хлеб."
          />

          <div className="mt-8 space-y-4 text-[1.0625rem] leading-relaxed text-ink-soft">
            <p>
              Название читается дважды, и оба чтения — про нас. Хвойный лес за стенами и стол, за
              которым уже ели. Здесь не нужно выбирать между «деревенским» и «городским»: зал
              выглядит строго, а еда — простая и сытная.
            </p>
            <p>
              Вечером играет живая музыка, по выходным собираются большие компании. Мы не берём
              брони на 20:00 в пятницу за неделю — просто позвоните, договоримся.
            </p>
          </div>
        </div>

        <aside className="grain relative overflow-hidden rounded-brand border border-kraft-300 bg-kraft-200/70 px-8 py-12 text-center">
          <Pinecone className="mx-auto h-12 w-auto text-brass" />
          <p className="mt-8 font-heading text-2xl italic leading-snug text-forest-700">
            «Пришли. Сели. Ели.»
          </p>
          <div className="rule-brass mx-auto mt-6 w-24" aria-hidden="true" />
          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            Три глагола, которые описывают любой хороший вечер у нас.
          </p>
        </aside>
      </div>
    </Section>
  )
}
