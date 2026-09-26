// localStorage can throw (private browsing, quota, disabled storage) - every access goes through
// here so the rest of the app never has to think about it, per SPEC §5.7. A failure just means
// "don't save this time", never a crash.

export function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage unavailable or full - the app continues, just without saving.
  }
}

export function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
