import { useState } from 'react'
import type { LocaleContent } from '../../content/types'
import type { Difficulty } from '../../engine/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'
import { SegmentedControl } from '../components/SegmentedControl'

interface SoloSetupScreenProps {
  locale: LocaleContent
  onStart: (difficulty: Difficulty) => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'hard', 'mixed']

export function SoloSetupScreen({ locale, onStart }: SoloSetupScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed')
  const s = locale.strings.setup
  const difficultyLabel: Record<Difficulty, string> = {
    easy: s.difficultyEasy,
    hard: s.difficultyHard,
    mixed: s.difficultyMixed,
  }

  return (
    <ScreenShell>
      <h1 className="font-display text-3xl text-ink">{locale.strings.solo.title}</h1>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.difficultyLabel}</h2>
        <SegmentedControl
          options={DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
          labelFor={(option) => difficultyLabel[option]}
        />
      </section>

      <Button onClick={() => onStart(difficulty)}>{locale.strings.roundIntro.start}</Button>
    </ScreenShell>
  )
}
