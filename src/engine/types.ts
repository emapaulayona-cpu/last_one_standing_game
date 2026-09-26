export type Difficulty = 'easy' | 'hard' | 'mixed'
export type CategoryLevel = 'easy' | 'hard'

export interface Category {
  id: string
  text: string
  level: CategoryLevel
  custom?: boolean
}

export type TimerSeconds = 5 | 10 | 15
export type CardsToWin = 3 | 5 | 10

export interface GameSettings {
  difficulty: Difficulty
  timerSeconds: TimerSeconds
  cardsToWin: CardsToWin
  soundOn: boolean
}

export interface Player {
  id: string
  name: string
  cardsWon: number
  /** false once eliminated (by timeout or challenge) for the current round; reset true at the start of every round. */
  activeThisRound: boolean
}

export type GamePhase =
  'setup' | 'roundIntro' | 'turnActive' | 'playerOut' | 'overtimePending' | 'roundWon' | 'gameOver'

export interface PendingChallenge {
  /** the player whose most recent tap can still be challenged */
  playerId: string
  /** the letter they tapped, freed back onto the wheel if the challenge succeeds */
  letter: string
}

export interface GameState {
  phase: GamePhase
  settings: GameSettings
  players: Player[]
  currentCategory: Category | null
  /** letters locked for the current (over)round, as they appear in the letter set */
  lockedLetters: string[]
  /** index into players[] for whoever is currently at bat */
  currentPlayerIndex: number
  /** index into players[] for who starts the round; rotates each round */
  roundStarterIndex: number
  /** epoch ms deadline for the active turn; null while no timer is running */
  deadline: number | null
  overtime: boolean
  lettersRequiredThisTurn: 1 | 2
  lettersGivenThisTurn: number
  pendingChallenge: PendingChallenge | null
  /** player id shown on the "player out" overlay, while phase === 'playerOut' */
  playerOutId: string | null
  roundWinnerId: string | null
  gameWinnerId: string | null
}

export type GameAction =
  | {
      type: 'CREATE_GAME'
      players: { id: string; name: string }[]
      settings: GameSettings
      category: Category
      starterIndex: number
    }
  | { type: 'SKIP_CATEGORY'; category: Category }
  | { type: 'START_ROUND'; deadline: number }
  | { type: 'TAP_LETTER'; letter: string; deadline: number }
  | { type: 'TIMER_EXPIRED'; forDeadline: number }
  | { type: 'CHALLENGE'; deadline: number }
  | { type: 'CONTINUE'; deadline: number }
  | { type: 'START_OVERTIME'; category: Category; deadline: number }
  | { type: 'NEXT_ROUND'; category: Category }
  | { type: 'REMATCH'; starterIndex: number; category: Category }
  | { type: 'QUIT' }
