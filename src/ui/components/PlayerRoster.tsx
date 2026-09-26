import type { Player } from '../../engine/types'

interface PlayerRosterProps {
  players: Player[]
  currentPlayerId?: string
}

export function PlayerRoster({ players, currentPlayerId }: PlayerRosterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {players.map((player) => {
        const isCurrent = player.id === currentPlayerId
        return (
          <span
            key={player.id}
            className={`rounded-full border px-3 py-1 font-body text-sm font-semibold transition-colors duration-300 ${
              isCurrent
                ? 'border-gold bg-gold text-ink'
                : player.activeThisRound
                  ? 'border-indigo/20 bg-surface text-ink'
                  : 'border-transparent bg-indigo-soft text-ink/40 line-through'
            }`}
          >
            {player.name}
          </span>
        )
      })}
    </div>
  )
}
