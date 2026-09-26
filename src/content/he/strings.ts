import type { LocaleStrings } from '../types'

export const strings: LocaleStrings = {
  appTitle: 'מי נשאר?',
  home: {
    newGame: 'משחק חדש',
  },
  setup: {
    title: 'הגדרת משחק',
    playersLabel: 'שחקנים',
    playerPlaceholder: 'שם השחקן',
    addPlayer: 'הוספת שחקן',
    removePlayer: 'הסרה',
    difficultyLabel: 'רמת קושי',
    difficultyEasy: 'קל',
    difficultyHard: 'קשה',
    difficultyMixed: 'מעורב',
    timerLabel: 'זמן לתור',
    timerSecondsSuffix: 'שניות',
    cardsToWinLabel: 'קלפים לניצחון',
    cardsToWinSuffix: 'קלפים',
    startGame: 'התחלת משחק',
    errorTooFewPlayers: 'צריך לפחות 2 שחקנים',
    errorTooManyPlayers: 'עד 8 שחקנים במשחק',
    errorEmptyName: 'לכל שחקן צריך להיות שם',
    errorDuplicateName: 'לשני שחקנים אין להיות אותו שם',
  },
  roundIntro: {
    categoryLabel: 'הקטגוריה',
    changeCategory: 'קטגוריה אחרת',
    startingPlayer: 'מתחיל/ה',
    start: 'התחלה',
  },
  gameBoard: {
    currentTurn: 'התור של',
    overtimeProgress: 'מתוך',
    quitLabel: 'יציאה',
    quitConfirm: 'לצאת מהמשחק? ההתקדמות במשחק הזה לא תישמר.',
  },
  playerOut: {
    heading: 'יצא/ה מהסיבוב',
    continueButton: 'המשך',
  },
  roundWon: {
    heading: 'זכה/תה בקלף',
    cardsCount: 'קלפים',
    nextRound: 'לסיבוב הבא',
  },
  gameOver: {
    heading: 'ניצח/ה במשחק',
    finalStandings: 'תוצאות סופיות',
    rematch: 'משחק חוזר',
    newGame: 'משחק חדש',
  },
}
