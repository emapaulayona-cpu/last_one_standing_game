interface CategoryCardProps {
  label: string
  text: string
}

export function CategoryCard({ label, text }: CategoryCardProps) {
  return (
    <div className="rounded-3xl border border-indigo/10 bg-surface px-8 py-10 text-center shadow-sm">
      <p className="font-body text-sm font-semibold text-indigo/60">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{text}</p>
    </div>
  )
}
