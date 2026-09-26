import { describe, expect, it } from 'vitest'
import { gameReducer } from './gameEngine'
import { turnActiveState } from './testHelpers'

describe('TIMER_EXPIRED', () => {
  it('marks the current player out and moves to playerOut when others remain active', () => {
    const state = turnActiveState({ currentPlayerIndex: 0, deadline: 1_000 })
    const next = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: 1_000 })

    expect(next.phase).toBe('playerOut')
    expect(next.playerOutId).toBe('p1')
    expect(next.players.find((p) => p.id === 'p1')?.activeThisRound).toBe(false)
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.deadline).toBeNull()
  })

  it('clears any pending challenge, since the turn ended without a tap', () => {
    const state = turnActiveState({
      currentPlayerIndex: 0,
      deadline: 1_000,
      pendingChallenge: { playerId: 'p3', letter: 'א' },
    })
    const next = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: 1_000 })
    expect(next.pendingChallenge).toBeNull()
  })

  it('ignores a stale expiry for a deadline that already moved on', () => {
    const state = turnActiveState({ deadline: 2_000 })
    const next = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: 1_000 })
    expect(next).toBe(state)
  })

  it('is a no-op outside turnActive', () => {
    const state = turnActiveState({ phase: 'playerOut', deadline: null })
    const next = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: 1_000 })
    expect(next).toBe(state)
  })
})

describe('CONTINUE', () => {
  it('resumes turnActive for the next player with a fresh deadline', () => {
    const state = turnActiveState({
      phase: 'playerOut',
      playerOutId: 'p1',
      currentPlayerIndex: 1,
      deadline: null,
    })
    const next = gameReducer(state, { type: 'CONTINUE', deadline: 4_000 })

    expect(next.phase).toBe('turnActive')
    expect(next.playerOutId).toBeNull()
    expect(next.deadline).toBe(4_000)
    expect(next.currentPlayerIndex).toBe(1)
  })

  it('is a no-op outside playerOut', () => {
    const state = turnActiveState()
    const next = gameReducer(state, { type: 'CONTINUE', deadline: 4_000 })
    expect(next).toBe(state)
  })
})
