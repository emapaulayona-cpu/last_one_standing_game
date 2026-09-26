import type { LocaleContent } from '../../content/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface PlayerOutScreenProps {
  locale: LocaleContent
  playerName: string
  onContinue: () => void
}

export function PlayerOutScreen({ locale, playerName, onContinue }: PlayerOutScreenProps) {
  const s = locale.strings.playerOut
  return (
    <ScreenShell>
      <div className="animate-pulse-ring flex size-24 items-center justify-center rounded-full bg-danger text-cream">
        <span className="font-display text-4xl">✕</span>
      </div>
      <p className="animate-shake font-display text-3xl text-danger">
        {playerName} {s.heading}
      </p>
      <Button onClick={onContinue}>{s.continueButton}</Button>
    </ScreenShell>
  )
}
