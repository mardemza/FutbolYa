export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'hace un momento'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `hace ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export function formatBadgeCount(count: number): string {
  if (count > 99) return '99+'
  return String(count)
}

export function notificationIcon(category: string): string {
  switch (category) {
    case 'championship':
      return 'trophy'
    case 'team':
      return 'groups'
    case 'match':
      return 'scoreboard'
    default:
      return 'info'
  }
}

export type DateGroup = 'today' | 'yesterday' | 'week' | 'older'

export function notificationDateGroup(iso: string): DateGroup {
  const date = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / 86400000)

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return 'week'
  return 'older'
}

export const DATE_GROUP_LABEL: Record<DateGroup, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  week: 'Esta semana',
  older: 'Anteriores',
}
