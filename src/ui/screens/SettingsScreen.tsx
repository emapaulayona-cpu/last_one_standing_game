import type { LocaleContent } from '../../content/types'
import type { TimerSeconds } from '../../engine/types'
import { TIMER_OPTIONS } from '../../engine/validation'
import { Button } from '../components/Button'
import { ScreenShell } from '../components/ScreenShell'
import { SegmentedControl } from '../components/SegmentedControl'

type SoundChoice = 'on' | 'off'
const SOUND_OPTIONS: SoundChoice[] = ['on', 'off']

interface SettingsScreenProps {
  locale: LocaleContent
  soundOn: boolean
  timerSeconds: TimerSeconds
  onChangeSoundOn: (soundOn: boolean) => void
  onChangeTimerSeconds: (seconds: TimerSeconds) => void
  onResetData: () => void
  onBack: () => void
}

export function SettingsScreen({
  locale,
  soundOn,
  timerSeconds,
  onChangeSoundOn,
  onChangeTimerSeconds,
  onResetData,
  onBack,
}: SettingsScreenProps) {
  const s = locale.strings.settings
  const soundLabel: Record<SoundChoice, string> = { on: s.soundOn, off: s.soundOff }

  return (
    <ScreenShell>
      <h1 className="font-display text-3xl text-ink">{s.title}</h1>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.soundLabel}</h2>
        <SegmentedControl
          options={SOUND_OPTIONS}
          value={soundOn ? 'on' : 'off'}
          onChange={(choice) => onChangeSoundOn(choice === 'on')}
          labelFor={(option) => soundLabel[option]}
        />
      </section>

      <section className="w-full">
        <h2 className="mb-2 font-body font-semibold text-indigo">{s.defaultTimerLabel}</h2>
        <SegmentedControl
          options={TIMER_OPTIONS}
          value={timerSeconds}
          onChange={onChangeTimerSeconds}
          labelFor={(option) => `${option} ${locale.strings.setup.timerSecondsSuffix}`}
        />
      </section>

      <button
        type="button"
        onClick={onResetData}
        className="min-h-11 font-body font-semibold text-danger underline decoration-danger/40 underline-offset-4 hover:text-danger/80"
      >
        {s.resetData}
      </button>

      <Button variant="secondary" onClick={onBack}>
        {s.back}
      </Button>
    </ScreenShell>
  )
}
