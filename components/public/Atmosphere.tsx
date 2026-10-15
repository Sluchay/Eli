import { Section, SectionHeading } from '@/components/ui/Section'
import { ChefIcon, GlassIcon, HouseIcon, MusicIcon } from '@/components/ui/icons'

/**
 * «Атмосфера».
 *
 * Пока у ресторана нет фотографий зала, секция работает на гравюрных иконках
 * и тексте. Когда появятся фото — этот же блок превращается в галерею
 * без изменения ритма страницы: 4 плитки в ряд на десктопе, лента на телефоне.
 */
const FEATURES = [
  {
    icon: HouseIcon,
    title: 'Пихтовый зал',
    text: 'Живые деревья вдоль стен и тёплый свет — как в лесу, только с официантами.',
  },
  {
    icon: ChefIcon,
    title: 'Открытая кухня',
    text: 'Видно, как готовят. Печь, гриль и никаких заготовок «на неделю вперёд».',
  },
  {
    icon: MusicIcon,
    title: 'Живая музыка',
    text: 'По четвергам и субботам — небольшие составы, джаз и русские песни.',
  },
  {
    icon: GlassIcon,
    title: 'Бар и настойки',
    text: 'Свои настойки на кедровых орехах, клюкве и травах. Безалкогольные тоже есть.',
  },
]

export function Atmosphere() {
  return (
    <Section tone="kraft-alt" size="lg">
      <SectionHeading
        eyebrow="Атмосфера"
        title="Место, куда возвращаются"
        align="center"
        ornament
      />

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <li key={feature.title} className="text-center sm:text-left">
              <Icon className="mx-auto h-8 w-8 text-brass sm:mx-0" />
              <h3 className="mt-5 font-heading text-xl text-forest-700">{feature.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{feature.text}</p>
            </li>
          )
        })}
      </ul>

      <p className="mt-12 text-center text-sm text-ink-soft/80">
        Фотографии зала и блюд появятся здесь, как только их пришлёт ресторан.
      </p>
    </Section>
  )
}
