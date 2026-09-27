interface TileMascotProps {
  letter?: string
  className?: string
}

// "Tile Alef": the wheel's own letter tile, tilted and given a bold sticker outline. No face —
// the personality comes from the angle and the die-cut edge, not an expression.
export function TileMascot({ letter = 'א', className = '' }: TileMascotProps) {
  return (
    <svg viewBox="0 0 160 160" role="presentation" aria-hidden="true" className={className}>
      <rect
        x="18"
        y="18"
        width="124"
        height="124"
        rx="26"
        fill="var(--color-gold)"
        stroke="var(--color-ink)"
        strokeWidth="6"
        transform="rotate(-4 80 80)"
      />
      <text
        x="80"
        y="108"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="80"
        fill="var(--color-ink)"
        transform="rotate(-4 80 80)"
      >
        {letter}
      </text>
      <path
        d="M118 30 h14 M124 24 v14"
        stroke="var(--color-mint)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M28 132 h11 M33.5 126.5 v11"
        stroke="var(--color-mint)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
