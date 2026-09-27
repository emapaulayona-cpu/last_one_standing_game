import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { safeGetItem, safeRemoveItem, safeSetItem } from './localStorage'

// vitest's default environment here is 'node', so there's no real `window` - these tests install
// a minimal fake covering exactly what localStorage.ts touches, restoring the previous global
// afterwards. This is enough to exercise the "storage throws" fallback paths without a DOM
// environment or a new test dependency.
function installFakeWindow(overrides: Partial<Storage> = {}) {
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
    ...overrides,
  }
  // @ts-expect-error - minimal fake, not a full jsdom window
  globalThis.window = { localStorage }
  return store
}

describe('localStorage wrapper', () => {
  let originalWindow: typeof globalThis.window

  beforeEach(() => {
    originalWindow = globalThis.window
  })

  afterEach(() => {
    globalThis.window = originalWindow
    vi.restoreAllMocks()
  })

  it('round-trips a value through set/get', () => {
    installFakeWindow()
    safeSetItem('k', 'v')
    expect(safeGetItem('k')).toBe('v')
  })

  it('removes a value', () => {
    installFakeWindow()
    safeSetItem('k', 'v')
    safeRemoveItem('k')
    expect(safeGetItem('k')).toBeNull()
  })

  it('returns null instead of throwing when getItem is unavailable (e.g. private browsing)', () => {
    installFakeWindow({
      getItem: () => {
        throw new Error('SecurityError')
      },
    })
    expect(() => safeGetItem('k')).not.toThrow()
    expect(safeGetItem('k')).toBeNull()
  })

  it('does not throw when setItem fails (e.g. quota exceeded)', () => {
    installFakeWindow({
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    })
    expect(() => safeSetItem('k', 'v')).not.toThrow()
  })

  it('does not throw when removeItem fails', () => {
    installFakeWindow({
      removeItem: () => {
        throw new Error('SecurityError')
      },
    })
    expect(() => safeRemoveItem('k')).not.toThrow()
  })

  it('returns null when window itself is unavailable', () => {
    // @ts-expect-error - simulating an environment with no window at all
    globalThis.window = undefined
    expect(() => safeGetItem('k')).not.toThrow()
    expect(safeGetItem('k')).toBeNull()
  })
})
