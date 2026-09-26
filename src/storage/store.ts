import { safeGetItem, safeRemoveItem, safeSetItem } from './localStorage'
import type { PersistedDataV1, SavedPlayer } from './types'

const STORAGE_KEY = 'mi-nishar:data'
const CURRENT_VERSION = 1

function defaultData(): PersistedDataV1 {
  return {
    version: CURRENT_VERSION,
    savedPlayers: [],
    customCategories: [],
    settings: { soundOn: true, timerSeconds: 10 },
  }
}

/** Loads saved data, falling back to fresh defaults on missing, corrupt, or unrecognized data. */
export function loadData(): PersistedDataV1 {
  const raw = safeGetItem(STORAGE_KEY)
  if (!raw) return defaultData()
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      parsed.version === CURRENT_VERSION
    ) {
      return parsed as PersistedDataV1
    }
    return defaultData()
  } catch {
    return defaultData()
  }
}

export function saveData(data: PersistedDataV1): void {
  safeSetItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetData(): PersistedDataV1 {
  safeRemoveItem(STORAGE_KEY)
  return defaultData()
}

/** Adds any name not already saved, with 0 wins. Existing entries (and their wins) are untouched. */
export function mergeSavedPlayers(existing: SavedPlayer[], names: string[]): SavedPlayer[] {
  const toAdd = names.filter((name) => !existing.some((player) => player.name === name))
  if (toAdd.length === 0) return existing
  return [...existing, ...toAdd.map((name) => ({ name, wins: 0 }))]
}

/** Increments a saved player's win count, adding them (with 1 win) if they aren't saved yet. */
export function bumpWins(players: SavedPlayer[], name: string): SavedPlayer[] {
  const existing = players.some((player) => player.name === name)
  if (!existing) return [...players, { name, wins: 1 }]
  return players.map((player) =>
    player.name === name ? { ...player, wins: player.wins + 1 } : player,
  )
}
