import type { Category } from '../engine/types'

export type LocaleCode = 'he' | 'en'
export type Direction = 'rtl' | 'ltr'

export interface LocaleStrings {
  appTitle: string
}

export interface LocaleContent {
  code: LocaleCode
  dir: Direction
  strings: LocaleStrings
  /** the 22 letters of the wheel, in display order */
  letters: string[]
  categories: Category[]
}
