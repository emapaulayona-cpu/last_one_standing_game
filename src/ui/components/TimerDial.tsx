interface TimerDialProps {
  /** seconds remaining, already clamped to >= 0 */
  secondsLeft: number
  totalSeconds: number
  onClick?: () => void
  label?: string
}

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TimerDial({ secondsLeft, totalSeconds, onClick, label }: TimerDialProps) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0
  const urgent = secondsLeft > 0 && secondsLeft <= 3
  const offset = CIRCUMFERENCE * (1 - progress)

  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      onClick={onClick}
      className="relative flex aspect-square w-[45%] min-w-28 items-center justify-center rounded-full"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          className="fill-none stroke-indigo-soft"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth="8"
          strokeLinecap="round"
          className={`fill-none transition-[stroke-dashoffset] duration-200 ${urgent ? 'stroke-danger' : 'stroke-gold'}`}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-indigo text-cream">
        {label ? (
          <span className="font-body text-lg font-semibold">{label}</span>
        ) : (
          <span className={`font-display text-4xl ${urgent ? 'text-danger' : ''}`}>
            {secondsLeft}
          </span>
        )}
      </div>
    </Tag>
  )
}
