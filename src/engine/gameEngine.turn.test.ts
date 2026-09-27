import { describe, expect, it } from 'vitest'
import { gameReducer } from './gameEngine'
import { turnActiveState } from './testHelpers'

describe('TAP_LETTER', () => {
  it('locks the letter, advances to the next active player, and resets the deadline', () => {
    const state = turnActiveState({ currentPlayerIndex: 0 })
    const next = gameReducer(state, { type: 'TAP_LETTER', letter: 'א', deadline: 9_000, now: 500 })

    expect(next.lockedLetters).toEqual(['א'])
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.deadline).toBe(9_000)
    expect(next.lettersGivenThisTurn).toBe(0)
    expect(next.pendingChallenge).toEqual({ playerId: 'p1', letter: 'א' })
  })

  it('skips a player who is already out for the round', () => {
    const players = turnActiveState().players.map((p, i) =>
      i === 1 ? { ...p, activeThisRound: false } : p,
    )
    const state = turnActiveState({ players, currentPlayerIndex: 0 })

    const next = gameReducer(state, { type: 'TAP_LETTER', letter: 'א', deadline: 9_000, now: 500 })
    expect(next.currentPlayerIndex).toBe(2)
  })

  it('ignores a letter that is already locked', () => {
    const state = turnActiveState({ lockedLetters: ['א'] })
    const next = gameReducer(state, { type: 'TAP_LETTER', letter: 'א', deadline: 9_000, now: 500 })
    expect(next).toBe(state)
  })

  it('is a no-op outside turnActive', () => {
    const state = turnActiveState({ phase: 'roundIntro' })
    const next = gameReducer(state, { type: 'TAP_LETTER', letter: 'א', deadline: 9_000, now: 500 })
    expect(next).toBe(state)
  })

  it('is a no-op if the tap arrives after the deadline already passed', () => {
    const state = turnActiveState({ deadline: 1_000 })
    const next = gameReducer(state, {
      type: 'TAP_LETTER',
      letter: 'א',
      deadline: 9_000,
      now: 1_001,
    })
    expect(next).toBe(state)
  })

  it('accepts a tap that arrives exactly at the deadline', () => {
    const state = turnActiveState({ deadline: 1_000 })
    const next = gameReducer(state, {
      type: 'TAP_LETTER',
      letter: 'א',
      deadline: 9_000,
      now: 1_000,
    })
    expect(next.lockedLetters).toEqual(['א'])
  })

  it('wraps back around to the first player when the last player in the roster taps', () => {
    const state = turnActiveState({ currentPlayerIndex: 2 })
    const next = gameReducer(state, { type: 'TAP_LETTER', letter: 'א', deadline: 9_000, now: 500 })
    expect(next.currentPlayerIndex).toBe(0)
  })

  it('replaces the previous pending challenge when a new letter is tapped', () => {
    const state = turnActiveState({
      currentPlayerIndex: 1,
      pendingChallenge: { playerId: 'p1', letter: 'ב' },
    })
    const next = gameReducer(state, { type: 'TAP_LETTER', letter: 'ג', deadline: 9_000, now: 500 })
    expect(next.pendingChallenge).toEqual({ playerId: 'p2', letter: 'ג' })
  })
})
