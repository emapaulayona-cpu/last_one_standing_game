import type { LocaleContent } from '../../content/types'
import type { GameState } from '../../engine/types'
import { PlayerRoster } from '../components/PlayerRoster'
import { ScreenShell } from '../components/ScreenShell'
import { TimerDial } from '../components/TimerDial'
import { Wheel } from '../components/Wheel'
import { useCountdown } from '../hooks/useCountdown'

interface GameBoardScreenProps {
  locale: LocaleContent
  state: GameState
  onTapLetter: (letter: string) => void
  onTimerExpired: (deadline: number) => void
  onQuit: () => void
}

export function GameBoardScreen({
  locale,
  state,
  onTapLetter,
  onTimerExpired,
  onQuit,
}: GameBoardScreenProps) {
  const remainingMs = useCountdown(state.deadline, onTimerExpired)
  const s = locale.strings.gameBoard
  const currentPlayer = state.players[state.currentPlayerIndex]

  return (
    <ScreenShell>
      <button
        type="button"
        onClick={onQuit}
        className="absolute start-4 top-4 min-h-11 rounded-xl px-3 font-body text-sm font-semibold text-indigo/60 hover:bg-indigo-soft"
      >
        ✕ {s.quitLabel}
      </button>
      <p className="font-body text-sm font-semibold text-indigo/60">
        {state.currentCategory?.text}
      </p>
      <p className="font-display text-2xl text-ink">
        {s.currentTurn} {currentPlayer?.name}
      </p>
      {state.overtime && (
        <p className="font-body text-sm font-semibold text-indigo">
          {state.lettersGivenThisTurn + 1} {s.overtimeProgress} {state.lettersRequiredThisTurn}
        </p>
      )}
      <Wheel letters={locale.letters} lockedLetters={state.lockedLetters} onTapLetter={onTapLetter}>
        <TimerDial
          secondsLeft={Math.ceil(remainingMs / 1000)}
          totalSeconds={state.settings.timerSeconds}
        />
      </Wheel>
      <PlayerRoster players={state.players} currentPlayerId={currentPlayer?.id} />
    </ScreenShell>
  )
}
