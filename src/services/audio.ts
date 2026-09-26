export type SoundName = 'tick' | 'urgentTick' | 'letterTap' | 'buzzer' | 'roundWin' | 'gameWin'

let ctx: AudioContext | null = null
let enabled = true

/** Must be called from a user gesture (the round's first Start tap) - iOS requires this. */
export function unlockAudio(): void {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
}

/** Muting is instant and global: every playSound call checks this, nothing needs to be re-wired. */
export function setSoundEnabled(value: boolean): void {
  enabled = value
}

function playTone(
  freq: number,
  durationMs: number,
  type: OscillatorType,
  gain: number,
  startAt = 0,
): void {
  if (!enabled || !ctx) return
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.connect(gainNode).connect(ctx.destination)

  const start = ctx.currentTime + startAt
  const end = start + durationMs / 1000
  gainNode.gain.setValueAtTime(gain, start)
  gainNode.gain.exponentialRampToValueAtTime(0.001, end)
  osc.start(start)
  osc.stop(end)
}

function playChord(freqs: number[], durationMs: number): void {
  freqs.forEach((freq, i) => playTone(freq, durationMs, 'triangle', 0.15, i * 0.08))
}

export function playSound(name: SoundName): void {
  switch (name) {
    case 'tick':
      playTone(880, 70, 'square', 0.06)
      break
    case 'urgentTick':
      playTone(1180, 80, 'square', 0.12)
      break
    case 'letterTap':
      playTone(660, 90, 'triangle', 0.18)
      break
    case 'buzzer':
      playTone(120, 450, 'sawtooth', 0.22)
      break
    case 'roundWin':
      playChord([523.25, 659.25, 783.99], 350)
      break
    case 'gameWin':
      playChord([523.25, 659.25, 783.99, 1046.5], 550)
      break
  }
}
