import { describe, expect, it } from 'vitest'
import { createSoloState, soloReducer } from './soloEngine'
import { letters } from '../content/he/letters'
import type { Category } from './types'

const category: Category = { id: 'c1', text: 'בדיקה', level: 'easy' }

describe('createSoloState', () => {
  it('starts active with no locked letters and a zero score', () => {
    const state = createSoloState('easy', category, 1_000)
    expect(state).toEqual({
      phase: 'active',
      difficulty: 'easy',
      category,
      lockedLetters: [],
      deadline: 1_000,
      score: 0,
    })
  })
})

describe('SOLO_TAP_LETTER', () => {
  it('locks the letter, increments the score, and resets the deadline', () => {
    const state = createSoloState('easy', category, 1_000)
    const next = soloReducer(state, { type: 'SOLO_TAP_LETTER', letter: 'א', deadline: 9_000 })

    expect(next.lockedLetters).toEqual(['א'])
    expect(next.score).toBe(1)
    expect(next.deadline).toBe(9_000)
    expect(next.phase).toBe('active')
  })

  it('ignores a letter that is already locked', () => {
    const state = { ...createSoloState('easy', category, 1_000), lockedLetters: ['א'] }
    const next = soloReducer(state, { type: 'SOLO_TAP_LETTER', letter: 'א', deadline: 9_000 })
    expect(next).toBe(state)
  })

  it('is a no-op once the game is over', () => {
    const state = { ...createSoloState('easy', category, 1_000), phase: 'over' as const }
    const next = soloReducer(state, { type: 'SOLO_TAP_LETTER', letter: 'א', deadline: 9_000 })
    expect(next).toBe(state)
  })

  it('ends the game once all 22 letters are used', () => {
    const state = {
      ...createSoloState('easy', category, 1_000),
      lockedLetters: letters.slice(0, 21),
      score: 21,
    }
    const lastLetter = letters[21]
    const next = soloReducer(state, {
      type: 'SOLO_TAP_LETTER',
      letter: lastLetter,
      deadline: 9_000,
    })

    expect(next.phase).toBe('over')
    expect(next.lockedLetters).toHaveLength(22)
    expect(next.score).toBe(22)
    expect(next.deadline).toBeNull()
  })
})

describe('SOLO_TIMER_EXPIRED', () => {
  it('ends the game when the deadline matches', () => {
    const state = createSoloState('easy', category, 1_000)
    const next = soloReducer(state, { type: 'SOLO_TIMER_EXPIRED', forDeadline: 1_000 })
    expect(next.phase).toBe('over')
    expect(next.deadline).toBeNull()
  })

  it('ignores a stale expiry for a deadline that already moved on', () => {
    const state = createSoloState('easy', category, 2_000)
    const next = soloReducer(state, { type: 'SOLO_TIMER_EXPIRED', forDeadline: 1_000 })
    expect(next).toBe(state)
  })

  it('is a no-op once the game is already over', () => {
    const state = {
      ...createSoloState('easy', category, 1_000),
      phase: 'over' as const,
      deadline: null,
    }
    const next = soloReducer(state, { type: 'SOLO_TIMER_EXPIRED', forDeadline: 1_000 })
    expect(next).toBe(state)
  })
})
