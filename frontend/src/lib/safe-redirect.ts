export function sanitizeRedirectPath(
  target: string | null | undefined,
  fallback = '/matches',
): string {
  if (!target) {
    return fallback
  }

  if (!target.startsWith('/')) {
    return fallback
  }

  if (target.startsWith('//')) {
    return fallback
  }

  return target
}
