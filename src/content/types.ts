import type { Category } from '../engine/types'

export type LocaleCode = 'he' | 'en'
export type Direction = 'rtl' | 'ltr'

export interface LocaleStrings {
  appTitle: string
  home: {
    newGame: string
  }
  setup: {
    title: string
    playersLabel: string
    playerPlaceholder: string
    addPlayer: string
    removePlayer: string
    difficultyLabel: string
    difficultyEasy: string
    difficultyHard: string
    difficultyMixed: string
    timerLabel: string
    timerSecondsSuffix: string
    cardsToWinLabel: string
    cardsToWinSuffix: string
    startGame: string
    errorTooFewPlayers: string
    errorTooManyPlayers: string
    errorEmptyName: string
    errorDuplicateName: string
  }
  roundIntro: {
    categoryLabel: string
    changeCategory: string
    startingPlayer: string
    start: string
  }
  gameBoard: {
    currentTurn: string
    overtimeProgress: string
    quitLabel: string
    quitConfirm: string
    challengeLabel: string
  }
  overtimeIntro: {
    heading: string
  }
  playerOut: {
    heading: string
    continueButton: string
  }
  roundWon: {
    heading: string
    cardsCount: string
    nextRound: string
  }
  gameOver: {
    heading: string
    finalStandings: string
    rematch: string
    newGame: string
  }
}

export interface LocaleContent {
  code: LocaleCode
  dir: Direction
  strings: LocaleStrings
  /** the 22 letters of the wheel, in display order */
  letters: string[]
  categories: Category[]
}
