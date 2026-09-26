import type { GameSettings, TimerSeconds, CardsToWin } from './types'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8
export const TIMER_OPTIONS: TimerSeconds[] = [5, 10, 15]
export const CARDS_TO_WIN_OPTIONS: CardsToWin[] = [3, 4, 5]

export type SetupError =
  | 'TOO_FEW_PLAYERS'
  | 'TOO_MANY_PLAYERS'
  | 'DUPLICATE_NAME'
  | 'EMPTY_NAME'
  | 'INVALID_TIMER'
  | 'INVALID_CARDS_TO_WIN'

export function validateSetup(
  playerNames: string[],
  settings: Pick<GameSettings, 'timerSeconds' | 'cardsToWin'>,
): SetupError[] {
  const errors: SetupError[] = []

  if (playerNames.some((name) => name.trim().length === 0)) {
    errors.push('EMPTY_NAME')
  }
  if (playerNames.length < MIN_PLAYERS) errors.push('TOO_FEW_PLAYERS')
  if (playerNames.length > MAX_PLAYERS) errors.push('TOO_MANY_PLAYERS')

  // Blank names are already covered by EMPTY_NAME; don't also flag them as duplicates of
  // each other just because two blank fields are both "".
  const nonEmptyLower = playerNames
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length > 0)
  const hasDuplicate = nonEmptyLower.some((name, index) => nonEmptyLower.indexOf(name) !== index)
  if (hasDuplicate) errors.push('DUPLICATE_NAME')

  if (!TIMER_OPTIONS.includes(settings.timerSeconds)) errors.push('INVALID_TIMER')
  if (!CARDS_TO_WIN_OPTIONS.includes(settings.cardsToWin)) errors.push('INVALID_CARDS_TO_WIN')

  return errors
}
