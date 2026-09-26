import { useEffect, useReducer, useState } from 'react'
import { he } from './content/he'
import { createInitialState, gameReducer } from './engine/gameEngine'
import { drawCategory, pickRandomIndex } from './engine/random'
import { now } from './services/clock'
import { GameBoardScreen } from './ui/screens/GameBoardScreen'
import { GameOverScreen } from './ui/screens/GameOverScreen'
import { HomeScreen } from './ui/screens/HomeScreen'
import { PlayerOutScreen } from './ui/screens/PlayerOutScreen'
import { RoundIntroScreen } from './ui/screens/RoundIntroScreen'
import { RoundWonScreen } from './ui/screens/RoundWonScreen'
import { SetupScreen } from './ui/screens/SetupScreen'

function deadlineIn(seconds: number): number {
  return now() + seconds * 1000
}

function App() {
  const locale = he
  const [view, setView] = useState<'home' | 'setup'>('home')
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  useEffect(() => {
    document.documentElement.lang = locale.code
    document.documentElement.dir = locale.dir
  }, [locale])

  // Overtime needs a freshly drawn category before play can resume; the reducer signals this by
  // pausing in overtimePending rather than drawing one itself, so it stays free of content data.
  useEffect(() => {
    if (state.phase !== 'overtimePending') return
    const category = drawCategory(locale.categories, state.settings.difficulty, Math.random)!
    dispatch({
      type: 'START_OVERTIME',
      category,
      deadline: deadlineIn(state.settings.timerSeconds),
    })
  }, [state.phase, state.settings.difficulty, state.settings.timerSeconds, locale.categories])

  if (state.phase === 'setup') {
    if (view === 'home') {
      return <HomeScreen locale={locale} onNewGame={() => setView('setup')} />
    }
    return (
      <SetupScreen
        locale={locale}
        onStart={(names, settings) => {
          const category = drawCategory(locale.categories, settings.difficulty, Math.random)
          if (!category) return
          dispatch({
            type: 'CREATE_GAME',
            players: names.map((name) => ({ id: crypto.randomUUID(), name })),
            settings,
            category,
            starterIndex: pickRandomIndex(names.length, Math.random),
          })
        }}
      />
    )
  }

  if (state.phase === 'roundIntro') {
    return (
      <RoundIntroScreen
        locale={locale}
        category={state.currentCategory!}
        startingPlayerName={state.players[state.roundStarterIndex].name}
        onSkipCategory={() => {
          const category = drawCategory(locale.categories, state.settings.difficulty, Math.random)
          if (category) dispatch({ type: 'SKIP_CATEGORY', category })
        }}
        onStartRound={() =>
          dispatch({ type: 'START_ROUND', deadline: deadlineIn(state.settings.timerSeconds) })
        }
      />
    )
  }

  if (state.phase === 'turnActive') {
    return (
      <GameBoardScreen
        locale={locale}
        state={state}
        onTapLetter={(letter) =>
          dispatch({
            type: 'TAP_LETTER',
            letter,
            deadline: deadlineIn(state.settings.timerSeconds),
          })
        }
        onTimerExpired={(deadline) => dispatch({ type: 'TIMER_EXPIRED', forDeadline: deadline })}
      />
    )
  }

  if (state.phase === 'playerOut') {
    const outPlayer = state.players.find((player) => player.id === state.playerOutId)!
    return (
      <PlayerOutScreen
        locale={locale}
        playerName={outPlayer.name}
        onContinue={() =>
          dispatch({ type: 'CONTINUE', deadline: deadlineIn(state.settings.timerSeconds) })
        }
      />
    )
  }

  if (state.phase === 'roundWon') {
    const winner = state.players.find((player) => player.id === state.roundWinnerId)!
    return (
      <RoundWonScreen
        locale={locale}
        winner={winner}
        onNextRound={() => {
          const category = drawCategory(locale.categories, state.settings.difficulty, Math.random)
          if (category) dispatch({ type: 'NEXT_ROUND', category })
        }}
      />
    )
  }

  if (state.phase === 'gameOver') {
    const winner = state.players.find((player) => player.id === state.gameWinnerId)!
    return (
      <GameOverScreen
        locale={locale}
        winner={winner}
        players={state.players}
        onRematch={() => {
          const category = drawCategory(locale.categories, state.settings.difficulty, Math.random)
          if (category) {
            dispatch({
              type: 'REMATCH',
              starterIndex: pickRandomIndex(state.players.length, Math.random),
              category,
            })
          }
        }}
        onNewGame={() => {
          dispatch({ type: 'QUIT' })
          setView('setup')
        }}
      />
    )
  }

  // overtimePending is a one-frame transitional phase; the effect above resolves it immediately.
  return null
}

export default App
