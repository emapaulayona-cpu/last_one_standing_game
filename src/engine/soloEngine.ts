import { LETTER_COUNT } from './gameEngine'
import type { Category, Difficulty } from './types'

export type SoloPhase = 'active' | 'over'

export interface SoloState {
  phase: SoloPhase
  difficulty: Difficulty
  category: Category
  lockedLetters: string[]
  /** epoch ms deadline for the current answer; null once the game is over */
  deadline: number | null
  /** SPEC §2.6: the score is simply the number of letters tapped */
  score: number
}

export type SoloAction =
  | { type: 'SOLO_TAP_LETTER'; letter: string; deadline: number }
  | { type: 'SOLO_TIMER_EXPIRED'; forDeadline: number }

export function createSoloState(
  difficulty: Difficulty,
  category: Category,
  deadline: number,
): SoloState {
  return { phase: 'active', difficulty, category, lockedLetters: [], deadline, score: 0 }
}

export function soloReducer(state: SoloState, action: SoloAction): SoloState {
  switch (action.type) {
    case 'SOLO_TAP_LETTER': {
      if (state.phase !== 'active') return state
      if (state.lockedLetters.includes(action.letter)) return state

      const lockedLetters = [...state.lockedLetters, action.letter]
      const score = state.score + 1

      if (lockedLetters.length >= LETTER_COUNT) {
        return { ...state, lockedLetters, score, phase: 'over', deadline: null }
      }
      return { ...state, lockedLetters, score, deadline: action.deadline }
    }

    case 'SOLO_TIMER_EXPIRED': {
      if (state.phase !== 'active') return state
      if (action.forDeadline !== state.deadline) return state
      return { ...state, phase: 'over', deadline: null }
    }

    default:
      return state
  }
}
