import type { LocaleContent } from '../../content/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface InstructionsScreenProps {
  locale: LocaleContent
  onBack: () => void
}

export function InstructionsScreen({ locale, onBack }: InstructionsScreenProps) {
  const s = locale.strings.instructions

  return (
    <ScreenShell>
      <h1 className="font-display text-3xl text-ink">{s.title}</h1>
      <p className="font-body text-lg text-indigo">{s.intro}</p>

      {s.sections.map((section) => (
        <section key={section.heading} className="w-full text-start">
          <h2 className="mb-2 font-display text-xl text-indigo">{section.heading}</h2>
          <p className="whitespace-pre-line font-body leading-relaxed text-ink">{section.body}</p>
        </section>
      ))}

      <Button variant="secondary" onClick={onBack}>
        {s.back}
      </Button>
    </ScreenShell>
  )
}
