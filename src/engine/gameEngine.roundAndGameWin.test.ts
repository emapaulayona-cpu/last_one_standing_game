import { describe, expect, it } from 'vitest'
import { gameReducer } from './gameEngine'
import { turnActiveState, otherCategory } from './testHelpers'

function withActive(state: ReturnType<typeof turnActiveState>, activeIds: string[]) {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, activeThisRound: activeIds.includes(p.id) })),
  }
}

describe('round win', () => {
  it('awards the card to the sole remaining active player via timeout', () => {
    const state = withActive(turnActiveState({ currentPlayerIndex: 0 }), ['p1', 'p2'])
    const next = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: state.deadline! })

    expect(next.phase).toBe('roundWon')
    expect(next.roundWinnerId).toBe('p2')
    expect(next.players.find((p) => p.id === 'p2')?.cardsWon).toBe(1)
  })

  it('goes straight to gameOver when the round win also reaches the card target', () => {
    let state = withActive(turnActiveState({ currentPlayerIndex: 0 }), ['p1', 'p2'])
    state = {
      ...state,
      settings: { ...state.settings, cardsToWin: 3 },
      players: state.players.map((p) => (p.id === 'p2' ? { ...p, cardsWon: 2 } : p)),
    }

    const next = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: state.deadline! })

    expect(next.phase).toBe('gameOver')
    expect(next.gameWinnerId).toBe('p2')
    expect(next.players.find((p) => p.id === 'p2')?.cardsWon).toBe(3)
  })
})

describe('NEXT_ROUND', () => {
  it('resets the round state, rotates the starter, and draws the next category', () => {
    const won = {
      ...turnActiveState(),
      phase: 'roundWon' as const,
      roundWinnerId: 'p2',
      roundStarterIndex: 0,
      lockedLetters: ['א'],
      overtime: true,
      lettersRequiredThisTurn: 2 as const,
      players: turnActiveState().players.map((p) =>
        p.id === 'p3' ? { ...p, activeThisRound: false } : p,
      ),
    }

    const next = gameReducer(won, { type: 'NEXT_ROUND', category: otherCategory })

    expect(next.phase).toBe('roundIntro')
    expect(next.currentCategory).toEqual(otherCategory)
    expect(next.roundStarterIndex).toBe(1)
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.lockedLetters).toEqual([])
    expect(next.overtime).toBe(false)
    expect(next.lettersRequiredThisTurn).toBe(1)
    expect(next.players.every((p) => p.activeThisRound)).toBe(true)
  })

  it('is a no-op outside roundWon', () => {
    const state = turnActiveState()
    const next = gameReducer(state, { type: 'NEXT_ROUND', category: otherCategory })
    expect(next).toBe(state)
  })
})

describe('REMATCH', () => {
  it('resets cards and players but keeps the roster, with a fresh starter and category', () => {
    const over = {
      ...turnActiveState(),
      phase: 'gameOver' as const,
      gameWinnerId: 'p1',
      players: turnActiveState().players.map((p) => (p.id === 'p1' ? { ...p, cardsWon: 3 } : p)),
    }

    const next = gameReducer(over, {
      type: 'REMATCH',
      starterIndex: 2,
      category: otherCategory,
    })

    expect(next.phase).toBe('roundIntro')
    expect(next.gameWinnerId).toBeNull()
    expect(next.roundStarterIndex).toBe(2)
    expect(next.currentPlayerIndex).toBe(2)
    expect(next.currentCategory).toEqual(otherCategory)
    expect(next.players.every((p) => p.cardsWon === 0 && p.activeThisRound)).toBe(true)
  })

  it('is a no-op outside gameOver', () => {
    const state = turnActiveState()
    const next = gameReducer(state, {
      type: 'REMATCH',
      starterIndex: 0,
      category: otherCategory,
    })
    expect(next).toBe(state)
  })
})

describe('QUIT', () => {
  it('resets to a fresh setup state from any phase', () => {
    const state = turnActiveState({ phase: 'gameOver' })
    const next = gameReducer(state, { type: 'QUIT' })
    expect(next.phase).toBe('setup')
    expect(next.players).toEqual([])
  })
})
