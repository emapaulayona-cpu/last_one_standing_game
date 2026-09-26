import type { LocaleContent } from '../../content/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface HomeScreenProps {
  locale: LocaleContent
  onNewGame: () => void
  onOpenSolo: () => void
  onOpenCategories: () => void
  onOpenScores: () => void
  onOpenInstructions: () => void
  onOpenSettings: () => void
}

export function HomeScreen({
  locale,
  onNewGame,
  onOpenSolo,
  onOpenCategories,
  onOpenScores,
  onOpenInstructions,
  onOpenSettings,
}: HomeScreenProps) {
  return (
    <ScreenShell>
      <div className="absolute end-4 top-4 flex gap-2">
        <button
          type="button"
          onClick={onOpenInstructions}
          aria-label={locale.strings.home.instructionsLabel}
          className="flex size-11 items-center justify-center rounded-xl text-2xl text-indigo/60 hover:bg-indigo-soft"
        >
          ❓
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={locale.strings.home.settingsLabel}
          className="flex size-11 items-center justify-center rounded-xl text-2xl text-indigo/60 hover:bg-indigo-soft"
        >
          ⚙
        </button>
      </div>
      <h1 className="font-display text-5xl text-ink">{locale.strings.appTitle}</h1>
      <Button onClick={onNewGame}>{locale.strings.home.newGame}</Button>
      <Button variant="secondary" onClick={onOpenSolo}>
        {locale.strings.home.soloLabel}
      </Button>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onOpenCategories}>
          {locale.strings.home.categoriesLabel}
        </Button>
        <Button variant="ghost" onClick={onOpenScores}>
          {locale.strings.home.scoresLabel}
        </Button>
      </div>
    </ScreenShell>
  )
}
