import type { GameAction, GameSettings, GameState, Player } from './types'

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'mixed',
  timerSeconds: 10,
  cardsToWin: 3,
  soundOn: true,
}

export const LETTER_COUNT = 22

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    settings: DEFAULT_SETTINGS,
    players: [],
    currentCategory: null,
    lockedLetters: [],
    currentPlayerIndex: 0,
    roundStarterIndex: 0,
    deadline: null,
    overtime: false,
    lettersRequiredThisTurn: 1,
    lettersGivenThisTurn: 0,
    pendingChallenge: null,
    playerOutId: null,
    roundWinnerId: null,
    gameWinnerId: null,
  }
}

function activeCount(players: Player[]): number {
  return players.filter((player) => player.activeThisRound).length
}

/** Finds the next active player after `fromIndex`, cycling through the roster. */
function nextActivePlayerIndex(players: Player[], fromIndex: number): number {
  for (let step = 1; step <= players.length; step += 1) {
    const index = (fromIndex + step) % players.length
    if (players[index].activeThisRound) return index
  }
  return fromIndex
}

function soleActivePlayer(players: Player[]): Player {
  const active = players.filter((player) => player.activeThisRound)
  if (active.length !== 1) {
    throw new Error('soleActivePlayer called without exactly one active player')
  }
  return active[0]
}

/** Awards a card to `winnerId` and returns the resulting players plus whether the game is now won. */
function awardCard(
  players: Player[],
  winnerId: string,
  cardsToWin: number,
): { players: Player[]; wonGame: boolean } {
  let wonGame = false
  const updated = players.map((player) => {
    if (player.id !== winnerId) return player
    const cardsWon = player.cardsWon + 1
    if (cardsWon >= cardsToWin) wonGame = true
    return { ...player, cardsWon }
  })
  return { players: updated, wonGame }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_GAME': {
      const players: Player[] = action.players.map((player) => ({
        id: player.id,
        name: player.name,
        cardsWon: 0,
        activeThisRound: true,
      }))
      return {
        ...createInitialState(),
        phase: 'roundIntro',
        settings: action.settings,
        players,
        currentCategory: action.category,
        roundStarterIndex: action.starterIndex,
        currentPlayerIndex: action.starterIndex,
      }
    }

    case 'SKIP_CATEGORY': {
      if (state.phase !== 'roundIntro') return state
      return { ...state, currentCategory: action.category }
    }

    case 'START_ROUND': {
      if (state.phase !== 'roundIntro') return state
      return {
        ...state,
        phase: 'turnActive',
        currentPlayerIndex: state.roundStarterIndex,
        deadline: action.deadline,
      }
    }

    case 'TAP_LETTER': {
      if (state.phase !== 'turnActive') return state
      if (state.lockedLetters.includes(action.letter)) return state

      const lockedLetters = [...state.lockedLetters, action.letter]
      const lettersGivenThisTurn = state.lettersGivenThisTurn + 1
      const currentPlayer = state.players[state.currentPlayerIndex]
      const allLettersLocked = lockedLetters.length >= LETTER_COUNT

      // Normally a turn ends once the required number of letters is given. But if the wheel
      // empties out mid-turn (e.g. the 1st of 2 required overtime letters is also the 22nd
      // letter), there are no letters left for a 2nd tap, so the turn must end right here too.
      if (lettersGivenThisTurn < state.lettersRequiredThisTurn && !allLettersLocked) {
        return { ...state, lockedLetters, lettersGivenThisTurn }
      }

      const nextIndex = nextActivePlayerIndex(state.players, state.currentPlayerIndex)

      if (allLettersLocked && activeCount(state.players) > 1) {
        return {
          ...state,
          phase: 'overtimePending',
          lockedLetters,
          lettersGivenThisTurn: 0,
          currentPlayerIndex: nextIndex,
          deadline: null,
          pendingChallenge: { playerId: currentPlayer.id, letter: action.letter },
        }
      }

      return {
        ...state,
        lockedLetters,
        lettersGivenThisTurn: 0,
        currentPlayerIndex: nextIndex,
        deadline: action.deadline,
        pendingChallenge: { playerId: currentPlayer.id, letter: action.letter },
      }
    }

    case 'TIMER_EXPIRED': {
      if (state.phase !== 'turnActive') return state
      if (action.forDeadline !== state.deadline) return state

      const outPlayer = state.players[state.currentPlayerIndex]
      const players = state.players.map((player) =>
        player.id === outPlayer.id ? { ...player, activeThisRound: false } : player,
      )

      if (activeCount(players) === 1) {
        const winner = soleActivePlayer(players)
        const { players: awarded, wonGame } = awardCard(
          players,
          winner.id,
          state.settings.cardsToWin,
        )
        return {
          ...state,
          players: awarded,
          phase: wonGame ? 'gameOver' : 'roundWon',
          roundWinnerId: winner.id,
          gameWinnerId: wonGame ? winner.id : null,
          deadline: null,
          pendingChallenge: null,
          lettersGivenThisTurn: 0,
        }
      }

      return {
        ...state,
        players,
        phase: 'playerOut',
        playerOutId: outPlayer.id,
        currentPlayerIndex: nextActivePlayerIndex(state.players, state.currentPlayerIndex),
        deadline: null,
        pendingChallenge: null,
        lettersGivenThisTurn: 0,
      }
    }

    case 'CHALLENGE': {
      if (state.phase !== 'turnActive' || state.pendingChallenge === null) return state

      const { playerId: challengedId, letter } = state.pendingChallenge
      const players = state.players.map((player) =>
        player.id === challengedId ? { ...player, activeThisRound: false } : player,
      )
      const lockedLetters = state.lockedLetters.filter((locked) => locked !== letter)

      if (activeCount(players) === 1) {
        const winner = soleActivePlayer(players)
        const { players: awarded, wonGame } = awardCard(
          players,
          winner.id,
          state.settings.cardsToWin,
        )
        return {
          ...state,
          players: awarded,
          lockedLetters,
          phase: wonGame ? 'gameOver' : 'roundWon',
          roundWinnerId: winner.id,
          gameWinnerId: wonGame ? winner.id : null,
          deadline: null,
          pendingChallenge: null,
        }
      }

      return {
        ...state,
        players,
        lockedLetters,
        deadline: action.deadline,
        pendingChallenge: null,
      }
    }

    case 'CONTINUE': {
      if (state.phase !== 'playerOut') return state
      return {
        ...state,
        phase: 'turnActive',
        playerOutId: null,
        deadline: action.deadline,
      }
    }

    case 'START_OVERTIME': {
      if (state.phase !== 'overtimePending') return state
      return {
        ...state,
        phase: 'turnActive',
        overtime: true,
        lettersRequiredThisTurn: 2,
        lettersGivenThisTurn: 0,
        lockedLetters: [],
        currentCategory: action.category,
        deadline: action.deadline,
      }
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'roundWon') return state
      const roundStarterIndex = (state.roundStarterIndex + 1) % state.players.length
      return {
        ...state,
        phase: 'roundIntro',
        players: state.players.map((player) => ({ ...player, activeThisRound: true })),
        lockedLetters: [],
        overtime: false,
        lettersRequiredThisTurn: 1,
        lettersGivenThisTurn: 0,
        pendingChallenge: null,
        playerOutId: null,
        roundWinnerId: null,
        currentCategory: action.category,
        roundStarterIndex,
        currentPlayerIndex: roundStarterIndex,
        deadline: null,
      }
    }

    case 'REMATCH': {
      if (state.phase !== 'gameOver') return state
      return {
        ...state,
        phase: 'roundIntro',
        players: state.players.map((player) => ({ ...player, cardsWon: 0, activeThisRound: true })),
        lockedLetters: [],
        overtime: false,
        lettersRequiredThisTurn: 1,
        lettersGivenThisTurn: 0,
        pendingChallenge: null,
        playerOutId: null,
        roundWinnerId: null,
        gameWinnerId: null,
        currentCategory: action.category,
        roundStarterIndex: action.starterIndex,
        currentPlayerIndex: action.starterIndex,
        deadline: null,
      }
    }

    case 'QUIT': {
      return createInitialState()
    }

    default:
      return state
  }
}
