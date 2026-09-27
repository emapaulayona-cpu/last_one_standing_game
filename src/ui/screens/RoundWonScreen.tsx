import type { LocaleContent } from '../../content/types'
import type { Player } from '../../engine/types'
import { Button } from '../components/Button'
import { Confetti } from '../components/Confetti'
import { ScreenShell } from '../components/ScreenShell'

interface RoundWonScreenProps {
  locale: LocaleContent
  winner: Player
  players: Player[]
  onNextRound: () => void
}

export function RoundWonScreen({ locale, winner, players, onNextRound }: RoundWonScreenProps) {
  const s = locale.strings.roundWon
  return (
    <ScreenShell>
      <Confetti pieceCount={24} />
      <p className="animate-pop font-display text-3xl text-ink">
        {winner.name} {s.heading}
      </p>
      <div className="w-full rounded-2xl bg-surface p-4">
        <ul className="flex flex-col gap-1 font-body text-ink">
          {players.map((player) => (
            <li key={player.id} className="flex justify-between">
              <span className={player.id === winner.id ? 'font-semibold' : undefined}>
                {player.name}
              </span>
              <span className="font-semibold">
                {player.cardsWon} {s.cardsCount}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={onNextRound}>{s.nextRound}</Button>
    </ScreenShell>
  )
}
