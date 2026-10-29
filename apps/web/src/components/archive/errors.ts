/**
 * HORTUS MANUS — readable API errors (owner: stage).
 * api.ts throws Error(message); network failures surface as TypeError. We map
 * both to a short human sentence; raw technical text stays in a second line.
 */

export function apiErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return '本地服务没有回应 / the local service did not answer'
  }
  if (error instanceof Error && error.message) {
    const raw = error.message.trim()
    if (
      !raw ||
      /^(not found|bad gateway|internal server error|service unavailable|failed to fetch)$/i.test(raw)
    ) {
      return '本地服务没有回应 / the local service did not answer'
    }
    return raw
  }
  return String(error)
}
