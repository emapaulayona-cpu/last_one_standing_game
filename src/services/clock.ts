/** The single source of "now" for deadline math, kept separate so it's easy to mock later. */
export function now(): number {
  return Date.now()
}
