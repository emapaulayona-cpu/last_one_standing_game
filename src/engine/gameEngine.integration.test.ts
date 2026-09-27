import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, gameReducer, createInitialState } from './gameEngine'
import { testCategory, otherCategory } from './testHelpers'

// Every other test file builds its fixture directly in the phase under test (via
// turnActiveState). This one instead chains real dispatches end to end, proving the phases
// documented in SPEC §5.3 actually connect: setup -> roundIntro -> turnActive -> playerOut ->
// roundWon -> roundIntro again.
describe('a full round, dispatched action by action', () => {
  it('chains setup through a timeout-decided round win and into the next round', () => {
    let state = createInitialState()

    state = gameReducer(state, {
      type: 'CREATE_GAME',
      players: [
        { id: 'p1', name: 'Alma' },
        { id: 'p2', name: 'Noa' },
      ],
      settings: DEFAULT_SETTINGS,
      category: testCategory,
      starterIndex: 0,
    })
    expect(state.phase).toBe('roundIntro')

    state = gameReducer(state, { type: 'START_ROUND', deadline: 10_000 })
    expect(state.phase).toBe('turnActive')
    expect(state.currentPlayerIndex).toBe(0)

    state = gameReducer(state, {
      type: 'TAP_LETTER',
      letter: 'א',
      deadline: 20_000,
      now: 5_000,
    })
    expect(state.phase).toBe('turnActive')
    expect(state.currentPlayerIndex).toBe(1)
    expect(state.lockedLetters).toEqual(['א'])

    // Noa's turn (index 1) times out. With only 2 players, that leaves exactly one active, so
    // the round ends immediately rather than passing through playerOut.
    state = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: 20_000 })
    expect(state.phase).toBe('roundWon')
    expect(state.roundWinnerId).toBe('p1')
    expect(state.players.find((p) => p.id === 'p1')?.cardsWon).toBe(1)

    state = gameReducer(state, { type: 'NEXT_ROUND', category: otherCategory })
    expect(state.phase).toBe('roundIntro')
    expect(state.currentCategory).toEqual(otherCategory)
    expect(state.roundStarterIndex).toBe(1)
    expect(state.players.every((p) => p.activeThisRound)).toBe(true)
  })

  it('chains through a timeout that leaves more than one player, via playerOut and CONTINUE', () => {
    let state = createInitialState()

    state = gameReducer(state, {
      type: 'CREATE_GAME',
      players: [
        { id: 'p1', name: 'Alma' },
        { id: 'p2', name: 'Noa' },
        { id: 'p3', name: 'Yoav' },
      ],
      settings: DEFAULT_SETTINGS,
      category: testCategory,
      starterIndex: 0,
    })
    state = gameReducer(state, { type: 'START_ROUND', deadline: 10_000 })

    state = gameReducer(state, { type: 'TIMER_EXPIRED', forDeadline: 10_000 })
    expect(state.phase).toBe('playerOut')
    expect(state.playerOutId).toBe('p1')
    expect(state.players.find((p) => p.id === 'p1')?.activeThisRound).toBe(false)

    state = gameReducer(state, { type: 'CONTINUE', deadline: 20_000 })
    expect(state.phase).toBe('turnActive')
    expect(state.currentPlayerIndex).toBe(1)
    expect(state.deadline).toBe(20_000)
  })
})
