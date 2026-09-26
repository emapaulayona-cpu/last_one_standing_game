import { useState } from 'react'
import type { LocaleContent } from '../../content/types'
import type { CardsToWin, Difficulty, GameSettings, TimerSeconds } from '../../engine/types'
import {
  CARDS_TO_WIN_OPTIONS,
  MAX_PLAYERS,
  TIMER_OPTIONS,
  validateSetup,
} from '../../engine/validation'
import type { SetupError } from '../../engine/validation'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface SetupScreenProps {
  locale: LocaleContent
  onStart: (names: string[], settings: GameSettings) => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'hard', 'mixed']

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: T[]
  value: T
  onChange: (value: T) => void
  labelFor: (option: T) => string
}) {
  return (
    <div className="flex justify-center gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`min-h-11 rounded-xl px-4 py-2 font-body font-semibold transition ${
            option === value ? 'bg-indigo text-cream' : 'bg-surface text-ink hover:bg-indigo-soft'
          }`}
        >
          {labelFor(option)}
        </button>
      ))}
    </div>
  )
}

export function SetupScreen({ locale, onStart }: SetupScreenProps) {
  const [names, setNames] = useState<string[]>(['', ''])
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed')
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(10)
  const [cardsToWin, setCardsToWin] = useState<CardsToWin>(3)
  const [errors, setErrors] = useState<SetupError[]>([])

  const s = locale.strings.setup
  const difficultyLabel: Record<Difficulty, string> = {
    easy: s.difficultyEasy,
    hard: s.difficultyHard,
    mixed: s.difficultyMixed,
  }
  const errorLabel: Record<SetupError, string> = {
    TOO_FEW_PLAYERS: s.errorTooFewPlayers,
    TOO_MANY_PLAYERS: s.errorTooManyPlayers,
    EMPTY_NAME: s.errorEmptyName,
    DUPLICATE_NAME: s.errorDuplicateName,
    INVALID_TIMER: '',
    INVALID_CARDS_TO_WIN: '',
  }

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((name, i) => (i === index ? value : name)))
  }

  function addPlayer() {
    if (names.length >= MAX_PLAYERS) return
    setNames((prev) => [...prev, ''])
  }

  function removePlayer(index: number) {
    setNames((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    const validationErrors = validateSetup(names, { timerSeconds, cardsToWin })
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    onStart(
      names.map((name) => name.trim()),
      { difficulty, timerSeconds, cardsToWin, soundOn: true },
    )
  }

  return (
    <ScreenShell>
      <h1 className="font-display text-3xl text-ink">{s.title}</h1>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.playersLabel}</h2>
        <div className="flex flex-col gap-2">
          {names.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder={s.playerPlaceholder}
                className="min-h-11 flex-1 rounded-xl border border-indigo/20 bg-surface px-4 py-2 text-center font-body text-ink outline-none focus:border-indigo"
              />
              {names.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  aria-label={s.removePlayer}
                  className="flex size-11 items-center justify-center rounded-xl text-indigo/60 hover:bg-indigo-soft"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {names.length < MAX_PLAYERS && (
          <button
            type="button"
            onClick={addPlayer}
            className="mt-2 min-h-11 w-full rounded-xl border border-dashed border-indigo/30 font-body text-indigo hover:bg-indigo-soft"
          >
            {s.addPlayer}
          </button>
        )}
      </section>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.difficultyLabel}</h2>
        <SegmentedControl
          options={DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
          labelFor={(option) => difficultyLabel[option]}
        />
      </section>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.timerLabel}</h2>
        <SegmentedControl
          options={TIMER_OPTIONS}
          value={timerSeconds}
          onChange={setTimerSeconds}
          labelFor={(option) => `${option} ${s.timerSecondsSuffix}`}
        />
      </section>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.cardsToWinLabel}</h2>
        <SegmentedControl
          options={CARDS_TO_WIN_OPTIONS}
          value={cardsToWin}
          onChange={setCardsToWin}
          labelFor={(option) => `${option} ${s.cardsToWinSuffix}`}
        />
      </section>

      {errors.length > 0 && (
        <ul className="font-body text-sm font-semibold text-danger">
          {[...new Set(errors)].map((error) =>
            errorLabel[error] ? <li key={error}>{errorLabel[error]}</li> : null,
          )}
        </ul>
      )}

      <Button onClick={handleSubmit}>{s.startGame}</Button>
    </ScreenShell>
  )
}
