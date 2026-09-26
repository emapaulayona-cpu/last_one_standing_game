import type { ReactNode } from 'react'

interface WheelProps {
  letters: string[]
  lockedLetters: string[]
  onTapLetter: (letter: string) => void
  disabled?: boolean
  children: ReactNode
}

/**
 * Lays out the 22 letters counter-clockwise starting at 12 o'clock, matching the reference
 * design. These are geometric x/y coordinates for a radially symmetric shape, not text-flow
 * positioning, so plain left/top (rather than logical inset properties) is the right tool here.
 */
export function Wheel({ letters, lockedLetters, onTapLetter, disabled, children }: WheelProps) {
  const count = letters.length

  return (
    <div className="relative mx-auto aspect-square w-[min(88vw,58vh,26rem)]">
      <div className="absolute inset-[16%] flex items-center justify-center">{children}</div>
      {letters.map((letter, index) => {
        const angle = (2 * Math.PI * index) / count
        const x = 50 - 42 * Math.sin(angle)
        const y = 50 - 42 * Math.cos(angle)
        const locked = lockedLetters.includes(letter)

        return (
          <button
            key={letter}
            type="button"
            disabled={disabled || locked}
            onClick={() => onTapLetter(letter)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl font-display text-xl shadow-sm transition sm:size-12 ${
              locked
                ? 'scale-90 animate-pop bg-indigo-soft text-ink/30 shadow-none'
                : 'bg-surface text-ink hover:bg-gold-soft active:scale-95 active:shadow-none'
            }`}
          >
            {letter}
          </button>
        )
      })}
    </div>
  )
}
