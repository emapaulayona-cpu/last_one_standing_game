import { describe, expect, it } from 'vitest'
import { validateSetup } from './validation'

const validSettings = { timerSeconds: 10 as const, cardsToWin: 3 as const }

describe('validateSetup', () => {
  it('accepts a valid 2-8 player setup', () => {
    expect(validateSetup(['Alma', 'Noa'], validSettings)).toEqual([])
  })

  it('rejects fewer than 2 players', () => {
    expect(validateSetup(['Alma'], validSettings)).toContain('TOO_FEW_PLAYERS')
  })

  it('rejects more than 8 players', () => {
    const names = Array.from({ length: 9 }, (_, i) => `P${i}`)
    expect(validateSetup(names, validSettings)).toContain('TOO_MANY_PLAYERS')
  })

  it('rejects duplicate names, case-insensitively after trimming', () => {
    expect(validateSetup(['Alma', ' alma '], validSettings)).toContain('DUPLICATE_NAME')
  })

  it('rejects an empty or blank name', () => {
    expect(validateSetup(['Alma', '   '], validSettings)).toContain('EMPTY_NAME')
  })

  it('does not flag two blank names as duplicates of each other', () => {
    const errors = validateSetup(['', ''], validSettings)
    expect(errors).toContain('EMPTY_NAME')
    expect(errors).not.toContain('DUPLICATE_NAME')
  })

  it('rejects a timer value outside 5/10/15', () => {
    expect(
      validateSetup(['Alma', 'Noa'], { ...validSettings, timerSeconds: 7 as never }),
    ).toContain('INVALID_TIMER')
  })

  it('rejects a cards-to-win value outside 3/4/5', () => {
    expect(validateSetup(['Alma', 'Noa'], { ...validSettings, cardsToWin: 1 as never })).toContain(
      'INVALID_CARDS_TO_WIN',
    )
  })
})
