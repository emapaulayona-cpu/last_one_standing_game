import type { Category, GameSettings, GameState, Player } from './types'
import { DEFAULT_SETTINGS, createInitialState } from './gameEngine'

export const testCategory: Category = { id: 'cat-1', text: 'בדיקה', level: 'easy' }
export const otherCategory: Category = { id: 'cat-2', text: 'בדיקה 2', level: 'easy' }

export function makePlayers(names: string[]): Player[] {
  return names.map((name, index) => ({
    id: `p${index + 1}`,
    name,
    cardsWon: 0,
    activeThisRound: true,
  }))
}

/** Builds a state already mid-turn, skipping the CREATE_GAME/START_ROUND ceremony. */
export function turnActiveState(overrides: Partial<GameState> = {}): GameState {
  const players = overrides.players ?? makePlayers(['Alma', 'Noa', 'Yoav'])
  const settings: GameSettings = { ...DEFAULT_SETTINGS, ...overrides.settings }
  return {
    ...createInitialState(),
    phase: 'turnActive',
    settings,
    players,
    currentCategory: testCategory,
    currentPlayerIndex: 0,
    roundStarterIndex: 0,
    deadline: 1_000,
    ...overrides,
  }
}
