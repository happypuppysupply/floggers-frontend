/**
 * Format a timestamp into relative "last active" text.
 * Returns "Active now" if within 2 minutes, otherwise "Xm ago", "Xh ago", "Xd ago".
 */
export function formatLastActive(timestamp: string | null | undefined): string {
  if (!timestamp) return ''

  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 2) return 'Active now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

/**
 * Check if a user is online (last active within 2 minutes).
 */
export function isOnline(timestamp: string | null | undefined): boolean {
  if (!timestamp) return false
  const diffMins = (Date.now() - new Date(timestamp).getTime()) / 60000
  return diffMins < 2
}
