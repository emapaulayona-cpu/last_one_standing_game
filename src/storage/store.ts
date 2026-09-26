import type { Difficulty } from '../engine/types'
import { safeGetItem, safeRemoveItem, safeSetItem } from './localStorage'
import type { PersistedDataV1, SavedPlayer, SoloRecords } from './types'

const STORAGE_KEY = 'mi-nishar:data'
const CURRENT_VERSION = 1

function defaultData(): PersistedDataV1 {
  return {
    version: CURRENT_VERSION,
    savedPlayers: [],
    customCategories: [],
    settings: { soundOn: true, timerSeconds: 10 },
    soloRecords: { easy: 0, hard: 0, mixed: 0 },
  }
}

/**
 * Loads saved data, backfilling any field a future version might add (like soloRecords, added
 * after players already had data saved) with its default rather than rejecting the whole thing -
 * a schema version bump would only be needed for a field whose *shape* actually changes.
 */
export function loadData(): PersistedDataV1 {
  const raw = safeGetItem(STORAGE_KEY)
  if (!raw) return defaultData()
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaultData()

    const base = defaultData()
    const data = parsed as Partial<PersistedDataV1>
    return {
      version: CURRENT_VERSION,
      savedPlayers: data.savedPlayers ?? base.savedPlayers,
      customCategories: data.customCategories ?? base.customCategories,
      settings: { ...base.settings, ...data.settings },
      soloRecords: { ...base.soloRecords, ...data.soloRecords },
    }
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

/** Updates a difficulty's best solo score if `score` beats it. */
export function updateSoloRecord(
  records: SoloRecords,
  difficulty: Difficulty,
  score: number,
): { records: SoloRecords; isNewRecord: boolean } {
  if (score <= records[difficulty]) return { records, isNewRecord: false }
  return { records: { ...records, [difficulty]: score }, isNewRecord: true }
}
