import { useState } from 'react'
import type { LocaleContent } from '../../content/types'
import type { CardsToWin, Difficulty, GameSettings, TimerSeconds } from '../../engine/types'
import { CARDS_TO_WIN_OPTIONS, MAX_PLAYERS, validateSetup } from '../../engine/validation'
import type { SetupError } from '../../engine/validation'
import type { SavedPlayer } from '../../storage/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'
import { SegmentedControl } from '../components/SegmentedControl'

interface SetupScreenProps {
  locale: LocaleContent
  savedPlayers: SavedPlayer[]
  hasCustomCategories: boolean
  timerSeconds: TimerSeconds
  onStart: (names: string[], settings: GameSettings) => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'hard', 'mixed']
type CustomOnlyChoice = 'yes' | 'no'
const CUSTOM_ONLY_OPTIONS: CustomOnlyChoice[] = ['no', 'yes']

export function SetupScreen({
  locale,
  savedPlayers,
  hasCustomCategories,
  timerSeconds,
  onStart,
}: SetupScreenProps) {
  const [names, setNames] = useState<string[]>(['', ''])
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed')
  const [customOnlyChoice, setCustomOnlyChoice] = useState<CustomOnlyChoice>('no')
  const [cardsToWin, setCardsToWin] = useState<CardsToWin>(3)
  const [errors, setErrors] = useState<SetupError[]>([])

  const s = locale.strings.setup
  const difficultyLabel: Record<Difficulty, string> = {
    easy: s.difficultyEasy,
    hard: s.difficultyHard,
    mixed: s.difficultyMixed,
  }
  const onOffLabel: Record<CustomOnlyChoice, string> = {
    yes: locale.strings.settings.soundOn,
    no: locale.strings.settings.soundOff,
  }
  const errorLabel: Record<SetupError, string> = {
    TOO_FEW_PLAYERS: s.errorTooFewPlayers,
    TOO_MANY_PLAYERS: s.errorTooManyPlayers,
    EMPTY_NAME: s.errorEmptyName,
    DUPLICATE_NAME: s.errorDuplicateName,
    INVALID_TIMER: s.errorInvalidTimer,
    INVALID_CARDS_TO_WIN: s.errorInvalidCardsToWin,
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

  function pickSavedPlayer(name: string) {
    const alreadyUsed = names.some((n) => n.trim().toLowerCase() === name.toLowerCase())
    if (alreadyUsed) return
    setNames((prev) => {
      const emptyIndex = prev.findIndex((n) => n.trim().length === 0)
      if (emptyIndex !== -1) return prev.map((n, i) => (i === emptyIndex ? name : n))
      if (prev.length >= MAX_PLAYERS) return prev
      return [...prev, name]
    })
  }

  function handleSubmit() {
    const validationErrors = validateSetup(names, { timerSeconds, cardsToWin })
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    onStart(
      names.map((name) => name.trim()),
      {
        difficulty,
        timerSeconds,
        cardsToWin,
        customOnly: customOnlyChoice === 'yes',
      },
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
        {savedPlayers.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 font-body text-sm text-indigo/60">{s.savedPlayersLabel}</p>
            <div className="flex flex-wrap gap-2">
              {savedPlayers.map((player) => (
                <button
                  key={player.name}
                  type="button"
                  onClick={() => pickSavedPlayer(player.name)}
                  className="min-h-11 rounded-full border border-indigo/20 bg-surface px-3 font-body text-sm text-ink hover:bg-indigo-soft"
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
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

      {hasCustomCategories && (
        <section className="w-full">
          <h2 className="mb-2 font-body font-semibold text-indigo">{s.customOnlyLabel}</h2>
          <SegmentedControl
            options={CUSTOM_ONLY_OPTIONS}
            value={customOnlyChoice}
            onChange={setCustomOnlyChoice}
            labelFor={(option) => onOffLabel[option]}
          />
        </section>
      )}

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
