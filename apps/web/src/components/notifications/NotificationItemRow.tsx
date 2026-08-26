import { Link } from 'react-router-dom'
import { formatRelativeTime, notificationIcon } from '../../lib/notificationUi'
import type { NotificationItem } from '../../types/notifications'
import { Icon } from '../Icon'

type NotificationItemRowProps = {
  notification: NotificationItem
  onMarkRead?: (id: string) => void
}

export function NotificationItemRow({ notification, onMarkRead }: NotificationItemRowProps) {
  return (
    <article
      className={[
        'relative flex gap-3 border-b border-outline-variant px-4 py-4 transition-colors',
        notification.isRead ? 'bg-surface-container-lowest' : 'bg-surface-container-low',
      ].join(' ')}
    >
      {!notification.isRead && (
        <span
          className="absolute bottom-0 left-0 top-0 w-1 bg-primary-fixed"
          aria-hidden
        />
      )}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
        <Icon name={notificationIcon(notification.category)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-headline text-sm font-semibold text-on-surface">{notification.title}</h3>
          <time
            className="shrink-0 font-label text-[10px] uppercase text-on-surface-variant"
            dateTime={notification.createdAt}
          >
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>
        <p className="text-sm text-on-surface-variant">{notification.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            to={notification.deepLink}
            className="text-sm font-bold text-primary hover:underline"
            onClick={() => {
              if (!notification.isRead) {
                onMarkRead?.(notification.id)
              }
            }}
          >
            Ver detalle
          </Link>
          {!notification.isRead && onMarkRead && (
            <button
              type="button"
              className="text-sm font-bold text-on-surface-variant hover:text-on-surface"
              onClick={() => onMarkRead(notification.id)}
            >
              Marcar leída
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
