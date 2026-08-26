import { apiRequest } from '../api'
import type { NotificationItem, PaginatedNotifications } from '../types/notifications'

export type ListNotificationsParams = {
  page?: number
  limit?: number
  category?: string
  championshipId?: string
  unreadOnly?: boolean
}

export function fetchNotifications(params: ListNotificationsParams = {}) {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.limit) search.set('limit', String(params.limit))
  if (params.category) search.set('category', params.category)
  if (params.championshipId) search.set('championshipId', params.championshipId)
  if (params.unreadOnly) search.set('unreadOnly', 'true')

  const query = search.toString()
  return apiRequest<PaginatedNotifications>(`/notifications${query ? `?${query}` : ''}`)
}

export function fetchUnreadCount() {
  return apiRequest<{ unreadCount: number }>('/notifications/unread-count')
}

export function markNotificationRead(id: string) {
  return apiRequest<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' })
}

export function markAllNotificationsRead(championshipId?: string) {
  const query = championshipId ? `?championshipId=${championshipId}` : ''
  return apiRequest<{ updated: number }>(`/notifications/read-all${query}`, { method: 'PATCH' })
}
