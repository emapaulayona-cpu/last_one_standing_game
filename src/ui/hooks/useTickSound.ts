import { useEffect } from 'react'
import { playSound } from '../../services/audio'

const URGENT_MS = 3000

/**
 * Plays a tick once per second normally, and twice per second in the last 3 seconds - SPEC §4
 * asks for both a color change *and* faster ticking as the deadline nears, and a faster tempo
 * reads as far more urgent than a pitch change alone. Shared by the multiplayer and solo boards
 * so the "last 3 seconds" rule only has to be encoded once.
 */
export function useTickSound(remainingMs: number) {
  const urgent = remainingMs > 0 && remainingMs <= URGENT_MS
  const tickKey = Math.ceil(remainingMs / (urgent ? 500 : 1000))

  useEffect(() => {
    if (remainingMs <= 0) return
    playSound(urgent ? 'urgentTick' : 'tick')
    // tickKey already encodes the half/whole-second boundary; re-running on urgent alone (its
    // own boundary crossing) is the intended one-time extra tick right as urgency kicks in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickKey, urgent])
}
