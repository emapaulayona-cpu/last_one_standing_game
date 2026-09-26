import type { LocaleContent } from '../../content/types'
import type { Player } from '../../engine/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface RoundWonScreenProps {
  locale: LocaleContent
  winner: Player
  onNextRound: () => void
}

export function RoundWonScreen({ locale, winner, onNextRound }: RoundWonScreenProps) {
  const s = locale.strings.roundWon
  return (
    <ScreenShell>
      <p className="font-display text-3xl text-ink">
        {winner.name} {s.heading}
      </p>
      <p className="font-body text-lg text-indigo">
        {winner.cardsWon} {s.cardsCount}
      </p>
      <Button onClick={onNextRound}>{s.nextRound}</Button>
    </ScreenShell>
  )
}
