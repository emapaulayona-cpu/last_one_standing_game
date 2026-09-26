import type { LocaleContent } from '../../content/types'
import type { Player } from '../../engine/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface GameOverScreenProps {
  locale: LocaleContent
  winner: Player
  players: Player[]
  onRematch: () => void
  onNewGame: () => void
}

export function GameOverScreen({
  locale,
  winner,
  players,
  onRematch,
  onNewGame,
}: GameOverScreenProps) {
  const s = locale.strings.gameOver
  return (
    <ScreenShell>
      <p className="font-display text-3xl text-gold">
        {winner.name} {s.heading}
      </p>
      <div className="w-full rounded-2xl bg-surface p-4">
        <p className="mb-2 font-body font-semibold text-indigo">{s.finalStandings}</p>
        <ul className="flex flex-col gap-1 font-body text-ink">
          {players.map((player) => (
            <li key={player.id} className="flex justify-between">
              <span>{player.name}</span>
              <span className="font-semibold">{player.cardsWon}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-3">
        <Button onClick={onRematch}>{s.rematch}</Button>
        <Button variant="secondary" onClick={onNewGame}>
          {s.newGame}
        </Button>
      </div>
    </ScreenShell>
  )
}
