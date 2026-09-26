import { describe, expect, it } from 'vitest'
import { createInitialState, gameReducer, DEFAULT_SETTINGS } from './gameEngine'
import { makePlayers, otherCategory, testCategory } from './testHelpers'

describe('CREATE_GAME', () => {
  it('moves from setup to roundIntro with the given players, settings and category', () => {
    const state = createInitialState()
    const next = gameReducer(state, {
      type: 'CREATE_GAME',
      players: [
        { id: 'p1', name: 'Alma' },
        { id: 'p2', name: 'Noa' },
      ],
      settings: DEFAULT_SETTINGS,
      category: testCategory,
      starterIndex: 1,
    })

    expect(next.phase).toBe('roundIntro')
    expect(next.players).toHaveLength(2)
    expect(next.players.every((p) => p.activeThisRound && p.cardsWon === 0)).toBe(true)
    expect(next.currentCategory).toEqual(testCategory)
    expect(next.roundStarterIndex).toBe(1)
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.deadline).toBeNull()
  })
})

describe('SKIP_CATEGORY', () => {
  it('replaces the current category while still in roundIntro', () => {
    const state = createInitialState()
    const inRoundIntro = gameReducer(state, {
      type: 'CREATE_GAME',
      players: [
        { id: 'p1', name: 'Alma' },
        { id: 'p2', name: 'Noa' },
      ],
      settings: DEFAULT_SETTINGS,
      category: testCategory,
      starterIndex: 0,
    })

    const next = gameReducer(inRoundIntro, { type: 'SKIP_CATEGORY', category: otherCategory })
    expect(next.currentCategory).toEqual(otherCategory)
  })

  it('is a no-op outside roundIntro', () => {
    const state = createInitialState()
    const next = gameReducer(state, { type: 'SKIP_CATEGORY', category: otherCategory })
    expect(next).toBe(state)
  })
})

describe('START_ROUND', () => {
  it('starts the timer for the round starter and moves to turnActive', () => {
    const state = createInitialState()
    const inRoundIntro = gameReducer(state, {
      type: 'CREATE_GAME',
      players: makePlayers(['Alma', 'Noa']),
      settings: DEFAULT_SETTINGS,
      category: testCategory,
      starterIndex: 1,
    })

    const next = gameReducer(inRoundIntro, { type: 'START_ROUND', deadline: 5_000 })
    expect(next.phase).toBe('turnActive')
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.deadline).toBe(5_000)
  })

  it('is a no-op outside roundIntro', () => {
    const state = createInitialState()
    const next = gameReducer(state, { type: 'START_ROUND', deadline: 5_000 })
    expect(next).toBe(state)
  })
})
