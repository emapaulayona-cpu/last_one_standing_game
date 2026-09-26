import type { LocaleContent } from '../../content/types'
import { ScreenShell } from '../components/ScreenShell'

export function OvertimeIntroScreen({ locale }: { locale: LocaleContent }) {
  return (
    <ScreenShell>
      <div className="size-16 animate-spin rounded-full border-4 border-indigo-soft border-t-indigo" />
      <p className="font-display text-2xl text-ink">{locale.strings.overtimeIntro.heading}</p>
    </ScreenShell>
  )
}
