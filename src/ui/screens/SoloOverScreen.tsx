import type { LocaleContent } from '../../content/types'
import { Button } from '../components/Button'
import { Confetti } from '../components/Confetti'
import { ScreenShell } from '../components/ScreenShell'

interface SoloOverScreenProps {
  locale: LocaleContent
  score: number
  bestScore: number
  isNewRecord: boolean
  endedByUsingAllLetters: boolean
  onPlayAgain: () => void
  onBackHome: () => void
}

export function SoloOverScreen({
  locale,
  score,
  bestScore,
  isNewRecord,
  endedByUsingAllLetters,
  onPlayAgain,
  onBackHome,
}: SoloOverScreenProps) {
  const s = locale.strings.soloOver

  return (
    <ScreenShell>
      {isNewRecord && <Confetti pieceCount={36} />}
      <p className="animate-pop font-display text-3xl text-ink">
        {endedByUsingAllLetters ? s.allLettersHeading : s.timeUpHeading}
      </p>
      <p className="font-display text-5xl text-indigo">{score}</p>
      <p className="font-body text-ink/60">{s.scoreLabel}</p>
      {isNewRecord ? (
        <p className="font-display text-2xl text-ink underline decoration-gold decoration-4 underline-offset-4">
          {s.newRecord}
        </p>
      ) : (
        <p className="font-body text-ink/60">
          {s.bestScoreLabel}: {bestScore}
        </p>
      )}
      <div className="flex gap-3">
        <Button onClick={onPlayAgain}>{s.playAgain}</Button>
        <Button variant="secondary" onClick={onBackHome}>
          {s.backHome}
        </Button>
      </div>
    </ScreenShell>
  )
}
