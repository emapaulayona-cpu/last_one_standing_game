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
  onChallenge: () => void
  onQuit: () => void
}

export function GameBoardScreen({
  locale,
  state,
  onTapLetter,
  onTimerExpired,
  onChallenge,
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
        <div
          className="flex gap-2"
          aria-label={`${state.lettersGivenThisTurn} ${s.overtimeProgress} ${state.lettersRequiredThisTurn}`}
        >
          {Array.from({ length: state.lettersRequiredThisTurn }, (_, i) => (
            <span
              key={i}
              className={`size-3 rounded-full ${i < state.lettersGivenThisTurn ? 'bg-gold' : 'bg-indigo-soft'}`}
            />
          ))}
        </div>
      )}
      <Wheel letters={locale.letters} lockedLetters={state.lockedLetters} onTapLetter={onTapLetter}>
        <TimerDial
          secondsLeft={Math.ceil(remainingMs / 1000)}
          totalSeconds={state.settings.timerSeconds}
        />
      </Wheel>
      <div className="flex min-h-11 items-center">
        {state.pendingChallenge && (
          <button
            type="button"
            onClick={onChallenge}
            className="min-h-11 animate-fade-in-up rounded-2xl border-2 border-danger px-5 py-2 font-body font-semibold text-danger hover:bg-danger/10"
          >
            {s.challengeLabel}
          </button>
        )}
      </div>
      <PlayerRoster players={state.players} currentPlayerId={currentPlayer?.id} />
    </ScreenShell>
  )
}
