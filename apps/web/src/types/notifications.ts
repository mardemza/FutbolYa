export type NotificationCategory = 'championship' | 'team' | 'match' | 'system'

export type NotificationItem = {
  id: string
  type: string
  category: NotificationCategory
  title: string
  body: string
  championshipId: string | null
  entityType: string | null
  entityId: string | null
  deepLink: string
  readAt: string | null
  createdAt: string
  isRead: boolean
}

export type PaginatedNotifications = {
  items: NotificationItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type NotificationNewPayload = {
  notification: NotificationItem
  unreadCount: number
}
