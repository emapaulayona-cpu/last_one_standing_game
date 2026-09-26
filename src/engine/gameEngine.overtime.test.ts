import { describe, expect, it } from 'vitest'
import { gameReducer } from './gameEngine'
import { turnActiveState, otherCategory } from './testHelpers'
import { letters } from '../content/he/letters'

const allButLast = letters.slice(0, letters.length - 1)
const lastLetter = letters[letters.length - 1]

describe('overtime', () => {
  it('locking the last letter with players still active moves to overtimePending', () => {
    const state = turnActiveState({ currentPlayerIndex: 0, lockedLetters: allButLast })
    const next = gameReducer(state, { type: 'TAP_LETTER', letter: lastLetter, deadline: 9_000 })

    expect(next.phase).toBe('overtimePending')
    expect(next.lockedLetters).toHaveLength(letters.length)
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.deadline).toBeNull()
    expect(next.pendingChallenge).toEqual({ playerId: 'p1', letter: lastLetter })
  })

  it('START_OVERTIME resets the wheel, doubles the letters required, and draws a new category', () => {
    const pending = gameReducer(
      turnActiveState({ currentPlayerIndex: 0, lockedLetters: allButLast }),
      { type: 'TAP_LETTER', letter: lastLetter, deadline: 9_000 },
    )
    const next = gameReducer(pending, {
      type: 'START_OVERTIME',
      category: otherCategory,
      deadline: 5_000,
    })

    expect(next.phase).toBe('turnActive')
    expect(next.overtime).toBe(true)
    expect(next.lettersRequiredThisTurn).toBe(2)
    expect(next.lockedLetters).toEqual([])
    expect(next.currentCategory).toEqual(otherCategory)
    expect(next.deadline).toBe(5_000)
  })

  it('requires two different-letter taps before the turn passes, without resetting the timer between them', () => {
    const overtimeState = turnActiveState({
      currentPlayerIndex: 1,
      overtime: true,
      lettersRequiredThisTurn: 2,
      lettersGivenThisTurn: 0,
      lockedLetters: [],
      deadline: 5_000,
    })

    const afterFirst = gameReducer(overtimeState, {
      type: 'TAP_LETTER',
      letter: 'א',
      deadline: 9_999,
    })
    expect(afterFirst.currentPlayerIndex).toBe(1)
    expect(afterFirst.lettersGivenThisTurn).toBe(1)
    expect(afterFirst.deadline).toBe(5_000)

    const afterSecond = gameReducer(afterFirst, {
      type: 'TAP_LETTER',
      letter: 'ב',
      deadline: 9_999,
    })
    expect(afterSecond.currentPlayerIndex).toBe(2)
    expect(afterSecond.lettersGivenThisTurn).toBe(0)
    expect(afterSecond.deadline).toBe(9_999)
  })

  it('ends the turn immediately if the wheel empties out before the 2nd required letter', () => {
    const overtimeState = turnActiveState({
      currentPlayerIndex: 1,
      overtime: true,
      lettersRequiredThisTurn: 2,
      lettersGivenThisTurn: 0,
      lockedLetters: allButLast,
      deadline: 5_000,
    })

    const next = gameReducer(overtimeState, {
      type: 'TAP_LETTER',
      letter: lastLetter,
      deadline: 9_999,
    })

    expect(next.phase).toBe('overtimePending')
    expect(next.lockedLetters).toHaveLength(letters.length)
  })

  it('a repeated overtime cycle still requires exactly 2 letters, not 3', () => {
    const secondPending = turnActiveState({
      currentPlayerIndex: 0,
      overtime: true,
      lettersRequiredThisTurn: 2,
      lockedLetters: allButLast,
    })
    const pending = gameReducer(secondPending, {
      type: 'TAP_LETTER',
      letter: lastLetter,
      deadline: 9_000,
    })
    const next = gameReducer(pending, {
      type: 'START_OVERTIME',
      category: otherCategory,
      deadline: 5_000,
    })

    expect(next.lettersRequiredThisTurn).toBe(2)
  })
})
