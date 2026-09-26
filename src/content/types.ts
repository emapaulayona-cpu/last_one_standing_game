import type { Category } from '../engine/types'

export type LocaleCode = 'he' | 'en'
export type Direction = 'rtl' | 'ltr'

export interface LocaleStrings {
  appTitle: string
  home: {
    newGame: string
    soloLabel: string
    categoriesLabel: string
    scoresLabel: string
    settingsLabel: string
  }
  setup: {
    title: string
    playersLabel: string
    playerPlaceholder: string
    addPlayer: string
    removePlayer: string
    savedPlayersLabel: string
    difficultyLabel: string
    difficultyEasy: string
    difficultyHard: string
    difficultyMixed: string
    customOnlyLabel: string
    timerSecondsSuffix: string
    cardsToWinLabel: string
    cardsToWinSuffix: string
    startGame: string
    errorTooFewPlayers: string
    errorTooManyPlayers: string
    errorEmptyName: string
    errorDuplicateName: string
  }
  settings: {
    title: string
    soundLabel: string
    soundOn: string
    soundOff: string
    defaultTimerLabel: string
    resetData: string
    resetConfirm: string
    back: string
  }
  categories: {
    title: string
    builtInLabel: string
    customLabel: string
    textPlaceholder: string
    levelLabel: string
    addButton: string
    saveButton: string
    deleteButton: string
    emptyCustom: string
    errorRequired: string
    errorTooLong: string
    errorDuplicate: string
    back: string
  }
  scores: {
    title: string
    winsSuffix: string
    empty: string
    soloRecordsLabel: string
    back: string
  }
  solo: {
    title: string
    scoreLabel: string
  }
  soloOver: {
    timeUpHeading: string
    allLettersHeading: string
    scoreLabel: string
    newRecord: string
    bestScoreLabel: string
    playAgain: string
    backHome: string
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
