import type { Category, Difficulty } from './types'

/** Returns a float in [0, 1), like Math.random. Injected so tests are deterministic. */
export type RandomFn = () => number

export function pickRandomIndex(length: number, random: RandomFn): number {
  return Math.floor(random() * length)
}

export function categoriesForDifficulty(
  categories: Category[],
  difficulty: Difficulty,
): Category[] {
  if (difficulty === 'mixed') return categories
  return categories.filter((category) => category.level === difficulty)
}

/** Draws a random category matching the difficulty filter, or null if none match. */
export function drawCategory(
  categories: Category[],
  difficulty: Difficulty,
  random: RandomFn,
): Category | null {
  const pool = categoriesForDifficulty(categories, difficulty)
  if (pool.length === 0) return null
  return pool[pickRandomIndex(pool.length, random)]
}
