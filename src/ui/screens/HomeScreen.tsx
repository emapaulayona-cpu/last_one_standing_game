import type { LocaleContent } from '../../content/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface HomeScreenProps {
  locale: LocaleContent
  onNewGame: () => void
  onOpenSettings: () => void
}

export function HomeScreen({ locale, onNewGame, onOpenSettings }: HomeScreenProps) {
  return (
    <ScreenShell>
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label={locale.strings.home.settingsLabel}
        className="absolute end-4 top-4 flex size-11 items-center justify-center rounded-xl text-2xl text-indigo/60 hover:bg-indigo-soft"
      >
        ⚙
      </button>
      <h1 className="font-display text-5xl text-ink">{locale.strings.appTitle}</h1>
      <Button onClick={onNewGame}>{locale.strings.home.newGame}</Button>
    </ScreenShell>
  )
}
