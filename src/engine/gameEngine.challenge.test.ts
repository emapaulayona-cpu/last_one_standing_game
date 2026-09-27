import { describe, expect, it } from 'vitest'
import { gameReducer } from './gameEngine'
import { turnActiveState } from './testHelpers'

describe('CHALLENGE', () => {
  it('eliminates the challenged player, unlocks their letter, and resets the current timer', () => {
    const state = turnActiveState({
      currentPlayerIndex: 1,
      lockedLetters: ['א', 'ב'],
      pendingChallenge: { playerId: 'p1', letter: 'ב' },
      deadline: 1_000,
    })
    const next = gameReducer(state, { type: 'CHALLENGE', deadline: 9_000 })

    expect(next.players.find((p) => p.id === 'p1')?.activeThisRound).toBe(false)
    expect(next.lockedLetters).toEqual(['א'])
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.deadline).toBe(9_000)
    expect(next.pendingChallenge).toBeNull()
  })

  it('does not pass the turn away from the current player', () => {
    const state = turnActiveState({
      currentPlayerIndex: 1,
      pendingChallenge: { playerId: 'p1', letter: 'א' },
    })
    const next = gameReducer(state, { type: 'CHALLENGE', deadline: 9_000 })
    expect(next.currentPlayerIndex).toBe(state.currentPlayerIndex)
  })

  it('ends the round if only one active player remains after the elimination', () => {
    const players = turnActiveState().players.map((p) =>
      p.id === 'p3' ? { ...p, activeThisRound: false } : p,
    )
    const state = turnActiveState({
      players,
      currentPlayerIndex: 1,
      pendingChallenge: { playerId: 'p1', letter: 'א' },
    })
    const next = gameReducer(state, { type: 'CHALLENGE', deadline: 9_000 })

    expect(next.phase).toBe('roundWon')
    expect(next.roundWinnerId).toBe('p2')
    expect(next.players.find((p) => p.id === 'p2')?.cardsWon).toBe(1)
  })

  it('goes straight to gameOver when the challenge-caused round win also reaches the card target', () => {
    const players = turnActiveState().players.map((p) => {
      if (p.id === 'p3') return { ...p, activeThisRound: false }
      if (p.id === 'p2') return { ...p, cardsWon: 2 }
      return p
    })
    const base = turnActiveState({
      players,
      currentPlayerIndex: 1,
      pendingChallenge: { playerId: 'p1', letter: 'א' },
    })
    const state = { ...base, settings: { ...base.settings, cardsToWin: 3 as const } }
    const next = gameReducer(state, { type: 'CHALLENGE', deadline: 9_000 })

    expect(next.phase).toBe('gameOver')
    expect(next.gameWinnerId).toBe('p2')
    expect(next.players.find((p) => p.id === 'p2')?.cardsWon).toBe(3)
  })

  it('is a no-op when there is no pending challenge', () => {
    const state = turnActiveState({ pendingChallenge: null })
    const next = gameReducer(state, { type: 'CHALLENGE', deadline: 9_000 })
    expect(next).toBe(state)
  })

  it('is a no-op outside turnActive', () => {
    const state = turnActiveState({
      phase: 'playerOut',
      pendingChallenge: { playerId: 'p1', letter: 'א' },
    })
    const next = gameReducer(state, { type: 'CHALLENGE', deadline: 9_000 })
    expect(next).toBe(state)
  })
})
