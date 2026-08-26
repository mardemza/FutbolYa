import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banner } from '../components/Banner'
import { NotificationItemRow } from '../components/notifications/NotificationItemRow'
import { useNotifications } from '../context/NotificationContext'
import {
  DATE_GROUP_LABEL,
  notificationDateGroup,
  type DateGroup,
} from '../lib/notificationUi'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/notificationsApi'
import type { NotificationItem } from '../types/notifications'

const GROUP_ORDER: DateGroup[] = ['today', 'yesterday', 'week', 'older']

export function NotificationsPage() {
  const { liveItems, refreshUnreadCount, markReadLocally } = useNotifications()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchNotifications({ page: targetPage, limit: 20 })
      setItems((prev) => (targetPage === 1 ? result.items : [...prev, ...result.items]))
      setPage(result.page)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPage(1)
  }, [loadPage])

  useEffect(() => {
    if (liveItems.length === 0) return
    setItems((prev) => {
      const merged = [...liveItems]
      for (const item of prev) {
        if (!merged.some((existing) => existing.id === item.id)) {
          merged.push(item)
        }
      }
      return merged.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    })
  }, [liveItems])

  const grouped = useMemo(() => {
    const map = new Map<DateGroup, NotificationItem[]>()
    for (const group of GROUP_ORDER) {
      map.set(group, [])
    }
    for (const item of items) {
      const group = notificationDateGroup(item.createdAt)
      if (group === 'older') {
        map.get('older')!.push(item)
      } else {
        map.get(group)!.push(item)
      }
    }
    return map
  }, [items])

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await markNotificationRead(id)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      markReadLocally(1)
      await refreshUnreadCount()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar como leída')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      )
      await refreshUnreadCount()
      setInfo('Todas las notificaciones fueron marcadas como leídas')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron marcar como leídas')
    }
  }

  const hasItems = items.length > 0

  return (
    <div className="space-y-gutter">
      <Banner error={error ?? undefined} info={info ?? undefined} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semibold uppercase text-on-surface">
            Centro de Notificaciones
          </h1>
          <p className="text-sm text-on-surface-variant">
            Avisos en tiempo real sobre tus campeonatos.
          </p>
        </div>
        {hasItems && (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="rounded-lg border-2 border-on-surface px-4 py-2 text-sm font-bold"
          >
            Marcar leídas
          </button>
        )}
      </div>

      {!loading && !hasItems && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
          <p className="mb-2 font-headline text-xl font-semibold text-on-surface">
            Sin novedades por ahora
          </p>
          <p className="text-sm text-on-surface-variant">
            Cuando haya actividad en tus campeonatos, la vas a ver acá al instante.
          </p>
        </div>
      )}

      {GROUP_ORDER.map((group) => {
        const groupItems = grouped.get(group) ?? []
        if (groupItems.length === 0) return null
        return (
          <section key={group} className="overflow-hidden rounded-lg border border-outline-variant bg-white">
            <h2 className="border-b border-outline-variant bg-surface-container-low px-4 py-3 font-label text-xs uppercase tracking-wider text-on-surface-variant">
              {DATE_GROUP_LABEL[group]}
            </h2>
            {groupItems.map((notification) => (
              <NotificationItemRow
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => void handleMarkRead(id)}
              />
            ))}
          </section>
        )
      })}

      {loading && (
        <p className="text-sm text-on-surface-variant">Cargando notificaciones…</p>
      )}

      {page < totalPages && !loading && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadPage(page + 1)}
            className="rounded-lg bg-primary-container px-5 py-3 font-bold text-on-primary-fixed"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  )
}
