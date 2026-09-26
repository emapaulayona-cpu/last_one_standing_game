interface SegmentedControlProps<T extends string | number> {
  options: T[]
  value: T
  onChange: (value: T) => void
  labelFor: (option: T) => string
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  labelFor,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex justify-center gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`min-h-11 rounded-xl px-4 py-2 font-body font-semibold transition ${
            option === value ? 'bg-indigo text-cream' : 'bg-surface text-ink hover:bg-indigo-soft'
          }`}
        >
          {labelFor(option)}
        </button>
      ))}
    </div>
  )
}
