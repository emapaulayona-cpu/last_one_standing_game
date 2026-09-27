import type { LocaleContent } from '../../content/types'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { ScreenShell } from '../components/ScreenShell'
import { TileMascot } from '../components/TileMascot'

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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 18% 8%, color-mix(in srgb, var(--color-gold) 35%, transparent), transparent 40%), ' +
            'radial-gradient(circle at 85% 18%, color-mix(in srgb, var(--color-indigo) 18%, transparent), transparent 45%), ' +
            'radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-mint) 16%, transparent), transparent 55%)',
        }}
      />

      <div className="absolute end-4 top-4 flex gap-2">
        <IconButton
          onClick={onOpenInstructions}
          aria-label={locale.strings.home.instructionsLabel}
          className="font-display text-2xl"
        >
          ?
        </IconButton>
        <IconButton onClick={onOpenSettings} aria-label={locale.strings.home.settingsLabel}>
          ⚙
        </IconButton>
      </div>

      <TileMascot className="w-32 drop-shadow-[0_10px_14px_rgba(69,59,168,0.28)]" />

      <h1 className="font-display text-5xl text-ink">{locale.strings.appTitle}</h1>
      <Button onClick={onNewGame}>{locale.strings.home.newGame}</Button>
      <Button variant="mint" onClick={onOpenSolo}>
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
