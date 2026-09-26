import { useEffect } from 'react'
import type { LocaleContent } from '../../content/types'
import type { SoloState } from '../../engine/soloEngine'
import type { TimerSeconds } from '../../engine/types'
import { playSound } from '../../services/audio'
import { ScreenShell } from '../components/ScreenShell'
import { TimerDial } from '../components/TimerDial'
import { Wheel } from '../components/Wheel'
import { useCountdown } from '../hooks/useCountdown'

interface SoloBoardScreenProps {
  locale: LocaleContent
  state: SoloState
  timerSeconds: TimerSeconds
  onTapLetter: (letter: string) => void
  onTimerExpired: (deadline: number) => void
  onQuit: () => void
}

export function SoloBoardScreen({
  locale,
  state,
  timerSeconds,
  onTapLetter,
  onTimerExpired,
  onQuit,
}: SoloBoardScreenProps) {
  const remainingMs = useCountdown(state.deadline, onTimerExpired)
  const secondsLeft = Math.ceil(remainingMs / 1000)
  const s = locale.strings.gameBoard

  useEffect(() => {
    if (secondsLeft > 0) playSound(secondsLeft <= 3 ? 'urgentTick' : 'tick')
  }, [secondsLeft])

  return (
    <ScreenShell>
      <button
        type="button"
        onClick={onQuit}
        className="absolute start-4 top-4 min-h-11 rounded-xl px-3 font-body text-sm font-semibold text-indigo/60 hover:bg-indigo-soft"
      >
        ✕ {s.quitLabel}
      </button>
      <p className="font-body text-sm font-semibold text-indigo/60">{state.category.text}</p>
      <p className="font-display text-2xl text-ink">
        {locale.strings.solo.scoreLabel}: {state.score}
      </p>
      <Wheel letters={locale.letters} lockedLetters={state.lockedLetters} onTapLetter={onTapLetter}>
        <TimerDial secondsLeft={secondsLeft} totalSeconds={timerSeconds} />
      </Wheel>
    </ScreenShell>
  )
}
