import { describe, expect, it } from 'vitest'
import { categoriesForDifficulty, drawCategory, pickRandomIndex } from './random'
import type { Category } from './types'

const categories: Category[] = [
  { id: 'e1', text: 'a', level: 'easy' },
  { id: 'e2', text: 'b', level: 'easy' },
  { id: 'h1', text: 'c', level: 'hard' },
]

describe('pickRandomIndex', () => {
  it('scales the injected random value into a valid index', () => {
    expect(pickRandomIndex(4, () => 0)).toBe(0)
    expect(pickRandomIndex(4, () => 0.99)).toBe(3)
    expect(pickRandomIndex(4, () => 0.5)).toBe(2)
  })
})

describe('categoriesForDifficulty', () => {
  it('filters by level, or returns everything for mixed', () => {
    expect(categoriesForDifficulty(categories, 'easy')).toHaveLength(2)
    expect(categoriesForDifficulty(categories, 'hard')).toHaveLength(1)
    expect(categoriesForDifficulty(categories, 'mixed')).toHaveLength(3)
  })
})

describe('drawCategory', () => {
  it('draws deterministically from the filtered pool using the injected random function', () => {
    const drawn = drawCategory(categories, 'easy', () => 0.99)
    expect(drawn?.id).toBe('e2')
  })

  it('returns null when no category matches the filter', () => {
    const onlyHard = categories.filter((c) => c.level === 'hard')
    expect(drawCategory(onlyHard, 'easy', () => 0)).toBeNull()
  })
})
