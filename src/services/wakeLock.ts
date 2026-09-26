let sentinel: WakeLockSentinel | null = null
let held = false

async function acquire(): Promise<void> {
  if (!('wakeLock' in navigator)) return
  try {
    sentinel = await navigator.wakeLock.request('screen')
  } catch {
    sentinel = null
  }
}

// The OS releases the lock whenever the tab is backgrounded, so it must be re-acquired on return.
function handleVisibilityChange(): void {
  if (held && document.visibilityState === 'visible') void acquire()
}

export function requestWakeLock(): void {
  held = true
  document.addEventListener('visibilitychange', handleVisibilityChange)
  void acquire()
}

export function releaseWakeLock(): void {
  held = false
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  void sentinel?.release().catch(() => {})
  sentinel = null
}
