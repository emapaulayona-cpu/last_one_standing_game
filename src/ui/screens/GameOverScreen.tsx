import type { LocaleContent } from '../../content/types'
import type { Player } from '../../engine/types'
import { Button } from '../components/Button'
import { Confetti } from '../components/Confetti'
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
      <Confetti pieceCount={48} />
      <p className="animate-pop font-display text-3xl text-gold">
        {winner.name} {s.heading}
      </p>
      <div className="w-full rounded-2xl bg-surface p-4">
        <p className="mb-2 font-body font-semibold text-indigo">{s.finalStandings}</p>
        <ul className="flex flex-col gap-1 font-body text-ink">
          {players.map((player, index) => (
            <li
              key={player.id}
              style={{ animationDelay: `${index * 80}ms` }}
              className="flex animate-fade-in-up justify-between"
            >
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
