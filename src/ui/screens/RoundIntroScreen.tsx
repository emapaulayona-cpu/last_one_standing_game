import type { LocaleContent } from '../../content/types'
import type { Category } from '../../engine/types'
import { Button } from '../components/Button'
import { CategoryCard } from '../components/CategoryCard'
import { ScreenShell } from '../components/ScreenShell'

interface RoundIntroScreenProps {
  locale: LocaleContent
  category: Category
  startingPlayerName: string
  onSkipCategory: () => void
  onStartRound: () => void
}

export function RoundIntroScreen({
  locale,
  category,
  startingPlayerName,
  onSkipCategory,
  onStartRound,
}: RoundIntroScreenProps) {
  const s = locale.strings.roundIntro

  return (
    <ScreenShell>
      <CategoryCard label={s.categoryLabel} text={category.text} />
      <button
        type="button"
        onClick={onSkipCategory}
        className="min-h-11 font-body font-semibold text-indigo underline decoration-indigo/40 underline-offset-4 hover:text-indigo-dark"
      >
        {s.changeCategory}
      </button>
      <p className="font-body text-lg text-ink">
        {s.startingPlayer}: <span className="font-semibold">{startingPlayerName}</span>
      </p>
      <Button onClick={onStartRound}>{s.start}</Button>
    </ScreenShell>
  )
}
