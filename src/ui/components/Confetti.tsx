const COLORS = [
  'var(--color-gold)',
  'var(--color-indigo)',
  'var(--color-danger)',
  'var(--color-indigo-soft)',
]
const MAX_PIECES = 48

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  drift: string
  color: string
  size: number
}

// Generated once at module load, not per render, so the component itself stays a pure function
// of its props - the burst pattern is fixed rather than re-randomized on every win, which is an
// unnoticeable, worthwhile trade for a decorative effect.
const PIECES: ConfettiPiece[] = Array.from({ length: MAX_PIECES }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.4,
  duration: 1.6 + Math.random() * 0.9,
  drift: `${(Math.random() - 0.5) * 120}px`,
  color: COLORS[i % COLORS.length],
  size: 6 + Math.random() * 6,
}))

interface ConfettiProps {
  pieceCount?: number
}

export function Confetti({ pieceCount = 24 }: ConfettiProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PIECES.slice(0, pieceCount).map((piece) => (
        <span
          key={piece.id}
          className="animate-confetti absolute top-0 rounded-sm"
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 0.4,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              '--drift': piece.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
