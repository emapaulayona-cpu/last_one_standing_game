// crypto.randomUUID only exists in secure contexts (HTTPS, or localhost) - it's undefined when
// testing over LAN via `npm run dev --host` from a phone, which would otherwise crash the app.
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
