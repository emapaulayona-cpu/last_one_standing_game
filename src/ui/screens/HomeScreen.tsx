import type { LocaleContent } from '../../content/types'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'

interface HomeScreenProps {
  locale: LocaleContent
  onNewGame: () => void
}

export function HomeScreen({ locale, onNewGame }: HomeScreenProps) {
  return (
    <ScreenShell>
      <h1 className="font-display text-5xl text-ink">{locale.strings.appTitle}</h1>
      <Button onClick={onNewGame}>{locale.strings.home.newGame}</Button>
    </ScreenShell>
  )
}
