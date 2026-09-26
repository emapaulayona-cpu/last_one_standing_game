import type { Category, Difficulty, TimerSeconds } from '../engine/types'

export interface SavedPlayer {
  name: string
  wins: number
}

export interface PersistedSettings {
  soundOn: boolean
  timerSeconds: TimerSeconds
}

/** Best solo score per difficulty (SPEC §2.6). */
export type SoloRecords = Record<Difficulty, number>

export interface PersistedDataV1 {
  version: 1
  savedPlayers: SavedPlayer[]
  customCategories: Category[]
  settings: PersistedSettings
  soloRecords: SoloRecords
}
