import { TIMER_OPTIONS } from '../engine/validation'
import type { Difficulty, TimerSeconds } from '../engine/types'
import { safeGetItem, safeRemoveItem, safeSetItem } from './localStorage'
import type { PersistedDataV1, PersistedSettings, SavedPlayer, SoloRecords } from './types'

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

function isValidTimerSeconds(value: unknown): value is TimerSeconds {
  return typeof value === 'number' && TIMER_OPTIONS.includes(value as TimerSeconds)
}

function sanitizeSettings(
  data: Partial<PersistedSettings> | undefined,
  fallback: PersistedSettings,
): PersistedSettings {
  return {
    soundOn: typeof data?.soundOn === 'boolean' ? data.soundOn : fallback.soundOn,
    timerSeconds: isValidTimerSeconds(data?.timerSeconds)
      ? data.timerSeconds
      : fallback.timerSeconds,
  }
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function sanitizeSoloRecords(
  data: Partial<SoloRecords> | undefined,
  fallback: SoloRecords,
): SoloRecords {
  return {
    easy: isNonNegativeNumber(data?.easy) ? data.easy : fallback.easy,
    hard: isNonNegativeNumber(data?.hard) ? data.hard : fallback.hard,
    mixed: isNonNegativeNumber(data?.mixed) ? data.mixed : fallback.mixed,
  }
}

/**
 * Loads saved data, backfilling any missing/invalid field with its default rather than rejecting
 * the whole payload - a schema version bump is only needed for a field whose *shape* actually
 * changes, and this also protects against a corrupted or hand-edited value (e.g. a timerSeconds
 * outside 5/10/15) silently flowing into the app instead of being caught here.
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
      savedPlayers: Array.isArray(data.savedPlayers) ? data.savedPlayers : base.savedPlayers,
      customCategories: Array.isArray(data.customCategories)
        ? data.customCategories
        : base.customCategories,
      settings: sanitizeSettings(data.settings, base.settings),
      soloRecords: sanitizeSoloRecords(data.soloRecords, base.soloRecords),
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
