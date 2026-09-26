import { useEffect, useReducer, useState } from 'react'
import { he } from './content/he'
import { createInitialState, gameReducer, LETTER_COUNT } from './engine/gameEngine'
import { drawCategory, pickRandomIndex } from './engine/random'
import { createSoloState, soloReducer } from './engine/soloEngine'
import type { SoloState } from './engine/soloEngine'
import type { Category, Difficulty } from './engine/types'
import { playSound, setSoundEnabled, unlockAudio } from './services/audio'
import { now } from './services/clock'
import { releaseWakeLock, requestWakeLock } from './services/wakeLock'
import {
  bumpWins,
  loadData,
  mergeSavedPlayers,
  resetData,
  saveData,
  updateSoloRecord,
} from './storage/store'
import type { PersistedDataV1 } from './storage/types'
import { CategoriesScreen } from './ui/screens/CategoriesScreen'
import { InstructionsScreen } from './ui/screens/InstructionsScreen'
import { GameBoardScreen } from './ui/screens/GameBoardScreen'
import { GameOverScreen } from './ui/screens/GameOverScreen'
import { HomeScreen } from './ui/screens/HomeScreen'
import { OvertimeIntroScreen } from './ui/screens/OvertimeIntroScreen'
import { PlayerOutScreen } from './ui/screens/PlayerOutScreen'
import { RoundIntroScreen } from './ui/screens/RoundIntroScreen'
import { RoundWonScreen } from './ui/screens/RoundWonScreen'
import { ScoresScreen } from './ui/screens/ScoresScreen'
import { SettingsScreen } from './ui/screens/SettingsScreen'
import { SetupScreen } from './ui/screens/SetupScreen'
import { SoloBoardScreen } from './ui/screens/SoloBoardScreen'
import { SoloOverScreen } from './ui/screens/SoloOverScreen'
import { SoloSetupScreen } from './ui/screens/SoloSetupScreen'

const OVERTIME_TRANSITION_MS = 900

function deadlineIn(seconds: number): number {
  return now() + seconds * 1000
}

type View = 'home' | 'setup' | 'settings' | 'categories' | 'scores' | 'soloSetup' | 'instructions'

function App() {
  const locale = he
  const [view, setView] = useState<View>('home')
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [persisted, setPersisted] = useState<PersistedDataV1>(() => loadData())
  const [soloState, setSoloState] = useState<SoloState | null>(null)
  const [soloResult, setSoloResult] = useState<{
    isNewRecord: boolean
    previousBest: number
  } | null>(null)
  // Tracks the phase as of the last render so a 'active' -> 'over' transition can be detected
  // exactly once during render (React's own pattern for "adjusting state when a value changes",
  // https://react.dev/learn/you-might-not-need-an-effect) - robust even if several dispatched
  // solo actions get applied between two renders, unlike deciding this from a closure value
  // inside the action handlers themselves.
  const [lastSoloPhase, setLastSoloPhase] = useState<SoloState['phase'] | undefined>(undefined)
  if (soloState?.phase !== lastSoloPhase) {
    if (lastSoloPhase === 'active' && soloState?.phase === 'over') {
      const previousBest = persisted.soloRecords[soloState.difficulty]
      setSoloResult({ isNewRecord: soloState.score > previousBest, previousBest })
    }
    setLastSoloPhase(soloState?.phase)
  }

  function updatePersisted(updater: (prev: PersistedDataV1) => PersistedDataV1) {
    setPersisted((prev) => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }

  function categoryPoolFor(customOnly: boolean): Category[] {
    return customOnly
      ? persisted.customCategories
      : [...locale.categories, ...persisted.customCategories]
  }

  function startSolo(difficulty: Difficulty) {
    const category = drawCategory(categoryPoolFor(false), difficulty, Math.random)
    if (!category) return
    unlockAudio()
    setSoloResult(null)
    setSoloState(createSoloState(difficulty, category, deadlineIn(persisted.settings.timerSeconds)))
  }

  // Reacts to the transition detected above: play the right sound and, once, persist a beaten
  // record. Runs only when soloResult itself changes, so it fires exactly once per solo game.
  useEffect(() => {
    if (!soloResult || !soloState) return
    playSound(soloResult.isNewRecord ? 'gameWin' : 'buzzer')
    if (soloResult.isNewRecord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      updatePersisted((prev) => ({
        ...prev,
        soloRecords: updateSoloRecord(prev.soloRecords, soloState.difficulty, soloState.score)
          .records,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloResult])

  useEffect(() => {
    document.documentElement.lang = locale.code
    document.documentElement.dir = locale.dir
  }, [locale])

  // Muting is instant and global (SPEC §5.5): every sound call already checks this flag, so
  // keeping it in sync with the global default is all that's needed here.
  useEffect(() => {
    setSoundEnabled(persisted.settings.soundOn)
  }, [persisted.settings.soundOn])

  // The screen should stay awake for the whole game, not just the active turn (SPEC §4). Keyed
  // on the boolean itself (not state.phase) so it doesn't release/reacquire on every turn change.
  const gameInProgress = state.phase !== 'setup' || soloState !== null
  useEffect(() => {
    if (gameInProgress) requestWakeLock()
    return releaseWakeLock
  }, [gameInProgress])

  useEffect(() => {
    if (state.phase === 'roundWon') playSound('roundWin')
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'gameOver') return
    playSound('gameWin')
    const winnerName = state.players.find((player) => player.id === state.gameWinnerId)?.name
    if (winnerName) {
      // Recording the win is a side effect syncing the game's outcome to persisted storage,
      // triggered whenever gameOver is entered (from either TIMER_EXPIRED or CHALLENGE) - there's
      // no single dispatch call site to do this at instead.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      updatePersisted((prev) => ({
        ...prev,
        savedPlayers: bumpWins(prev.savedPlayers, winnerName),
      }))
    }
    // Runs once per game-over entry; re-running on every persisted update would double-count wins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  // Overtime needs a freshly drawn category before play can resume; the reducer signals this by
  // pausing in overtimePending rather than drawing one itself, so it stays free of content data.
  // The short delay lets the "wheel resets" transition actually be seen, not just flash by.
  useEffect(() => {
    if (state.phase !== 'overtimePending') return
    const timeout = setTimeout(() => {
      const category = drawCategory(
        categoryPoolFor(state.settings.customOnly),
        state.settings.difficulty,
        Math.random,
      )!
      dispatch({
        type: 'START_OVERTIME',
        category,
        deadline: deadlineIn(state.settings.timerSeconds),
      })
    }, OVERTIME_TRANSITION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.phase,
    state.settings.difficulty,
    state.settings.customOnly,
    state.settings.timerSeconds,
  ])

  if (soloState) {
    if (soloState.phase === 'active') {
      return (
        <SoloBoardScreen
          locale={locale}
          state={soloState}
          timerSeconds={persisted.settings.timerSeconds}
          onTapLetter={(letter) => {
            playSound('letterTap')
            const deadline = deadlineIn(persisted.settings.timerSeconds)
            setSoloState(
              (prev) => prev && soloReducer(prev, { type: 'SOLO_TAP_LETTER', letter, deadline }),
            )
          }}
          onTimerExpired={(deadline) =>
            setSoloState(
              (prev) =>
                prev && soloReducer(prev, { type: 'SOLO_TIMER_EXPIRED', forDeadline: deadline }),
            )
          }
          onQuit={() => {
            if (window.confirm(locale.strings.gameBoard.quitConfirm)) {
              setSoloState(null)
              setView('home')
            }
          }}
        />
      )
    }
    return (
      <SoloOverScreen
        locale={locale}
        score={soloState.score}
        bestScore={soloResult?.isNewRecord ? soloState.score : (soloResult?.previousBest ?? 0)}
        isNewRecord={soloResult?.isNewRecord ?? false}
        endedByUsingAllLetters={soloState.lockedLetters.length >= LETTER_COUNT}
        onPlayAgain={() => startSolo(soloState.difficulty)}
        onBackHome={() => {
          setSoloState(null)
          setView('home')
        }}
      />
    )
  }

  if (view === 'soloSetup' && state.phase === 'setup') {
    return <SoloSetupScreen locale={locale} onStart={startSolo} />
  }

  if (state.phase === 'setup') {
    if (view === 'home') {
      return (
        <HomeScreen
          locale={locale}
          onNewGame={() => setView('setup')}
          onOpenSolo={() => setView('soloSetup')}
          onOpenCategories={() => setView('categories')}
          onOpenScores={() => setView('scores')}
          onOpenInstructions={() => setView('instructions')}
          onOpenSettings={() => setView('settings')}
        />
      )
    }
    if (view === 'instructions') {
      return <InstructionsScreen locale={locale} onBack={() => setView('home')} />
    }
    if (view === 'settings') {
      return (
        <SettingsScreen
          locale={locale}
          soundOn={persisted.settings.soundOn}
          timerSeconds={persisted.settings.timerSeconds}
          onChangeSoundOn={(soundOn) =>
            updatePersisted((prev) => ({ ...prev, settings: { ...prev.settings, soundOn } }))
          }
          onChangeTimerSeconds={(timerSeconds) =>
            updatePersisted((prev) => ({ ...prev, settings: { ...prev.settings, timerSeconds } }))
          }
          onResetData={() => {
            if (window.confirm(locale.strings.settings.resetConfirm)) {
              setPersisted(resetData())
            }
          }}
          onBack={() => setView('home')}
        />
      )
    }
    if (view === 'categories') {
      return (
        <CategoriesScreen
          locale={locale}
          customCategories={persisted.customCategories}
          onAddCustom={(text, level) =>
            updatePersisted((prev) => ({
              ...prev,
              customCategories: [
                ...prev.customCategories,
                { id: crypto.randomUUID(), text, level, custom: true },
              ],
            }))
          }
          onUpdateCustom={(id, text, level) =>
            updatePersisted((prev) => ({
              ...prev,
              customCategories: prev.customCategories.map((category) =>
                category.id === id ? { ...category, text, level } : category,
              ),
            }))
          }
          onDeleteCustom={(id) =>
            updatePersisted((prev) => ({
              ...prev,
              customCategories: prev.customCategories.filter((category) => category.id !== id),
            }))
          }
          onBack={() => setView('home')}
        />
      )
    }
    if (view === 'scores') {
      return (
        <ScoresScreen
          locale={locale}
          savedPlayers={persisted.savedPlayers}
          soloRecords={persisted.soloRecords}
          onBack={() => setView('home')}
        />
      )
    }
    return (
      <SetupScreen
        locale={locale}
        savedPlayers={persisted.savedPlayers}
        hasCustomCategories={persisted.customCategories.length > 0}
        soundOn={persisted.settings.soundOn}
        timerSeconds={persisted.settings.timerSeconds}
        onStart={(names, settings) => {
          const category = drawCategory(
            categoryPoolFor(settings.customOnly),
            settings.difficulty,
            Math.random,
          )
          if (!category) return
          updatePersisted((prev) => ({
            ...prev,
            savedPlayers: mergeSavedPlayers(prev.savedPlayers, names),
          }))
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
          const category = drawCategory(
            categoryPoolFor(state.settings.customOnly),
            state.settings.difficulty,
            Math.random,
          )
          if (category) dispatch({ type: 'SKIP_CATEGORY', category })
        }}
        onStartRound={() => {
          unlockAudio()
          dispatch({ type: 'START_ROUND', deadline: deadlineIn(state.settings.timerSeconds) })
        }}
      />
    )
  }

  if (state.phase === 'turnActive') {
    return (
      <GameBoardScreen
        locale={locale}
        state={state}
        onTapLetter={(letter) => {
          playSound('letterTap')
          dispatch({
            type: 'TAP_LETTER',
            letter,
            deadline: deadlineIn(state.settings.timerSeconds),
          })
        }}
        onTimerExpired={(deadline) => {
          playSound('buzzer')
          dispatch({ type: 'TIMER_EXPIRED', forDeadline: deadline })
        }}
        onChallenge={() =>
          dispatch({ type: 'CHALLENGE', deadline: deadlineIn(state.settings.timerSeconds) })
        }
        onQuit={() => {
          if (window.confirm(locale.strings.gameBoard.quitConfirm)) {
            dispatch({ type: 'QUIT' })
            setView('home')
          }
        }}
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
          const category = drawCategory(
            categoryPoolFor(state.settings.customOnly),
            state.settings.difficulty,
            Math.random,
          )
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
          const category = drawCategory(
            categoryPoolFor(state.settings.customOnly),
            state.settings.difficulty,
            Math.random,
          )
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

  // overtimePending
  return <OvertimeIntroScreen locale={locale} />
}

export default App
