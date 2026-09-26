import type { LocaleContent } from '../../content/types'
import type { SavedPlayer } from '../../storage/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface ScoresScreenProps {
  locale: LocaleContent
  savedPlayers: SavedPlayer[]
  onBack: () => void
}

export function ScoresScreen({ locale, savedPlayers, onBack }: ScoresScreenProps) {
  const s = locale.strings.scores
  const sorted = [...savedPlayers].sort((a, b) => b.wins - a.wins)

  return (
    <ScreenShell>
      <h1 className="font-display text-3xl text-ink">{s.title}</h1>

      {sorted.length === 0 ? (
        <p className="font-body text-ink/60">{s.empty}</p>
      ) : (
        <ul className="flex w-full flex-col gap-2">
          {sorted.map((player) => (
            <li
              key={player.name}
              className="flex items-center justify-between rounded-2xl border border-indigo/10 bg-surface px-4 py-3"
            >
              <span className="font-body font-semibold text-ink">{player.name}</span>
              <span className="font-body text-indigo">
                {player.wins} {s.winsSuffix}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Button variant="secondary" onClick={onBack}>
        {s.back}
      </Button>
    </ScreenShell>
  )
}
