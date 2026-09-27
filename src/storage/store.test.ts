import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  bumpWins,
  loadData,
  mergeSavedPlayers,
  resetData,
  saveData,
  updateSoloRecord,
} from './store'
import type { PersistedDataV1 } from './types'

function installFakeWindow() {
  const store = new Map<string, string>()
  const localStorage: Storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value)
    },
    removeItem: (key) => {
      store.delete(key)
    },
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size
    },
  }
  // @ts-expect-error - minimal fake, not a full jsdom window
  globalThis.window = { localStorage }
}

describe('loadData / saveData / resetData', () => {
  let originalWindow: typeof globalThis.window

  beforeEach(() => {
    originalWindow = globalThis.window
    installFakeWindow()
  })

  afterEach(() => {
    globalThis.window = originalWindow
  })

  it('returns fresh defaults when nothing is saved yet', () => {
    expect(loadData()).toEqual({
      version: 1,
      savedPlayers: [],
      customCategories: [],
      settings: { soundOn: true, timerSeconds: 10 },
      soloRecords: { easy: 0, hard: 0, mixed: 0 },
    })
  })

  it('returns defaults when the saved data is corrupt JSON', () => {
    window.localStorage.setItem('mi-nishar:data', '{not json')
    expect(loadData()).toEqual({
      version: 1,
      savedPlayers: [],
      customCategories: [],
      settings: { soundOn: true, timerSeconds: 10 },
      soloRecords: { easy: 0, hard: 0, mixed: 0 },
    })
  })

  it('round-trips real data through save and load', () => {
    const data: PersistedDataV1 = {
      version: 1,
      savedPlayers: [{ name: 'Alma', wins: 2 }],
      customCategories: [{ id: 'c1', text: 'משהו', level: 'easy', custom: true }],
      settings: { soundOn: false, timerSeconds: 15 },
      soloRecords: { easy: 5, hard: 3, mixed: 9 },
    }
    saveData(data)
    expect(loadData()).toEqual(data)
  })

  it('backfills a field missing from older saved data instead of discarding everything', () => {
    window.localStorage.setItem(
      'mi-nishar:data',
      JSON.stringify({
        version: 1,
        savedPlayers: [{ name: 'Alma', wins: 1 }],
        customCategories: [],
        settings: { soundOn: true, timerSeconds: 10 },
        // soloRecords intentionally omitted, as if saved before that field existed
      }),
    )
    const loaded = loadData()
    expect(loaded.savedPlayers).toEqual([{ name: 'Alma', wins: 1 }])
    expect(loaded.soloRecords).toEqual({ easy: 0, hard: 0, mixed: 0 })
  })

  it('falls back to the default timer when the saved value is not one of 5/10/15', () => {
    window.localStorage.setItem(
      'mi-nishar:data',
      JSON.stringify({
        version: 1,
        savedPlayers: [],
        customCategories: [],
        settings: { soundOn: true, timerSeconds: 7 },
        soloRecords: { easy: 0, hard: 0, mixed: 0 },
      }),
    )
    expect(loadData().settings.timerSeconds).toBe(10)
  })

  it('falls back to 0 for a corrupt (negative or non-numeric) solo record', () => {
    window.localStorage.setItem(
      'mi-nishar:data',
      JSON.stringify({
        version: 1,
        savedPlayers: [],
        customCategories: [],
        settings: { soundOn: true, timerSeconds: 10 },
        soloRecords: { easy: -3, hard: 'lots', mixed: 9 },
      }),
    )
    const loaded = loadData()
    expect(loaded.soloRecords).toEqual({ easy: 0, hard: 0, mixed: 9 })
  })

  it('falls back to an empty array when savedPlayers is not actually an array', () => {
    window.localStorage.setItem(
      'mi-nishar:data',
      JSON.stringify({
        version: 1,
        savedPlayers: 'oops',
        customCategories: [],
        settings: { soundOn: true, timerSeconds: 10 },
        soloRecords: { easy: 0, hard: 0, mixed: 0 },
      }),
    )
    expect(loadData().savedPlayers).toEqual([])
  })

  it('resetData clears storage and returns fresh defaults', () => {
    saveData({
      version: 1,
      savedPlayers: [{ name: 'Alma', wins: 1 }],
      customCategories: [],
      settings: { soundOn: true, timerSeconds: 10 },
      soloRecords: { easy: 0, hard: 0, mixed: 0 },
    })
    const reset = resetData()
    expect(reset.savedPlayers).toEqual([])
    expect(loadData().savedPlayers).toEqual([])
  })
})

describe('mergeSavedPlayers', () => {
  it('adds new names with 0 wins, leaving existing entries untouched', () => {
    const existing = [{ name: 'Alma', wins: 2 }]
    expect(mergeSavedPlayers(existing, ['Alma', 'Noa'])).toEqual([
      { name: 'Alma', wins: 2 },
      { name: 'Noa', wins: 0 },
    ])
  })

  it('returns the same array reference when there is nothing new to add', () => {
    const existing = [{ name: 'Alma', wins: 2 }]
    expect(mergeSavedPlayers(existing, ['Alma'])).toBe(existing)
  })
})

describe('bumpWins', () => {
  it('increments an existing player without touching others', () => {
    const players = [
      { name: 'Alma', wins: 2 },
      { name: 'Noa', wins: 1 },
    ]
    expect(bumpWins(players, 'Noa')).toEqual([
      { name: 'Alma', wins: 2 },
      { name: 'Noa', wins: 2 },
    ])
  })

  it('adds a new entry with 1 win if the player was not saved yet', () => {
    expect(bumpWins([], 'Alma')).toEqual([{ name: 'Alma', wins: 1 }])
  })
})

describe('updateSoloRecord', () => {
  it('updates the record when the score beats it', () => {
    const result = updateSoloRecord({ easy: 5, hard: 0, mixed: 0 }, 'easy', 8)
    expect(result).toEqual({ records: { easy: 8, hard: 0, mixed: 0 }, isNewRecord: true })
  })

  it('leaves the record alone when the score does not beat it', () => {
    const records = { easy: 5, hard: 0, mixed: 0 }
    const result = updateSoloRecord(records, 'easy', 3)
    expect(result).toEqual({ records, isNewRecord: false })
  })

  it('does not count an equal score as a new record', () => {
    const records = { easy: 5, hard: 0, mixed: 0 }
    expect(updateSoloRecord(records, 'easy', 5).isNewRecord).toBe(false)
  })
})
