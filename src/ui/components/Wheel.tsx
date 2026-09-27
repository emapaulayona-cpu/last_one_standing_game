import type { ReactNode } from 'react'
import type { Direction } from '../../content/types'

interface WheelProps {
  letters: string[]
  lockedLetters: string[]
  onTapLetter: (letter: string) => void
  dir: Direction
  disabled?: boolean
  children: ReactNode
}

/**
 * Lays out the letters starting at 12 o'clock, going counter-clockwise for RTL (the natural
 * right-to-left reading direction) and clockwise for LTR, so a future English wheel mirrors
 * automatically per SPEC §5.6 instead of keeping Hebrew's rotation direction. These are geometric
 * x/y coordinates for a radially symmetric shape, not text-flow positioning, so plain left/top
 * (rather than logical inset properties) is the right tool here - only the rotation direction
 * needs to know about `dir`.
 */
export function Wheel({
  letters,
  lockedLetters,
  onTapLetter,
  dir,
  disabled,
  children,
}: WheelProps) {
  const count = letters.length
  const sign = dir === 'rtl' ? -1 : 1

  return (
    <div className="relative mx-auto aspect-square w-[min(88vw,58vh,26rem,100%)]">
      <div className="absolute inset-[16%] flex items-center justify-center">{children}</div>
      {letters.map((letter, index) => {
        const angle = (2 * Math.PI * index) / count
        const x = 50 + sign * 42 * Math.sin(angle)
        const y = 50 - 42 * Math.cos(angle)
        const locked = lockedLetters.includes(letter)

        return (
          <button
            key={letter}
            type="button"
            disabled={disabled || locked}
            onClick={() => onTapLetter(letter)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="group absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            {/* The tap target above stays at the full 44px minimum (SPEC §4), but the visible
                tile is drawn smaller here so neighboring tiles don't visually overlap on narrow
                phones, where 22 targets around the ring leave under 44px between centers. */}
            <span
              className={`flex size-9 items-center justify-center rounded-xl font-display text-xl shadow-sm transition sm:size-10 ${
                locked
                  ? 'scale-90 animate-pop bg-indigo-soft text-ink/30 shadow-none'
                  : 'bg-surface text-ink group-hover:bg-gold-soft group-active:scale-95 group-active:shadow-none'
              }`}
            >
              {letter}
            </span>
          </button>
        )
      })}
    </div>
  )
}
