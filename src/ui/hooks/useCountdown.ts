import { useEffect, useRef, useState } from 'react'
import { now } from '../../services/clock'

/**
 * Ticks down to `deadline` on every animation frame and calls `onExpire` once when it passes.
 * Per SPEC §5.4, the source of truth is the deadline timestamp, not a counter.
 */
export function useCountdown(deadline: number | null, onExpire: (deadline: number) => void) {
  const [remainingMs, setRemainingMs] = useState(() => (deadline === null ? 0 : deadline - now()))
  const expiredForRef = useRef<number | null>(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (deadline === null) return

    let frame: number
    const tick = () => {
      const remaining = deadline - now()
      setRemainingMs(Math.max(0, remaining))
      if (remaining <= 0) {
        if (expiredForRef.current !== deadline) {
          expiredForRef.current = deadline
          onExpireRef.current(deadline)
        }
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [deadline])

  return deadline === null ? 0 : remainingMs
}
