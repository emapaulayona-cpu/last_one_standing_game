import type { Category, TimerSeconds } from '../engine/types'

export interface SavedPlayer {
  name: string
  wins: number
}

export interface PersistedSettings {
  soundOn: boolean
  timerSeconds: TimerSeconds
}

export interface PersistedDataV1 {
  version: 1
  savedPlayers: SavedPlayer[]
  customCategories: Category[]
  settings: PersistedSettings
}
