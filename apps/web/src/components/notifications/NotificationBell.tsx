import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { formatBadgeCount } from '../../lib/notificationUi'
import { Icon } from '../Icon'

export function NotificationBell() {
  const { unreadCount } = useNotifications()
  const badge = unreadCount > 0 ? formatBadgeCount(unreadCount) : null

  return (
    <Link
      to="/notifications"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} notificaciones sin leer`
          : 'Notificaciones'
      }
      className="relative flex items-center justify-center rounded-lg p-1 text-primary-fixed transition-colors hover:bg-white/10"
    >
      <Icon name="notifications" className="pointer-events-none text-2xl" />
      {badge && (
        <span className="pointer-events-none absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1 font-label text-[10px] font-bold text-on-primary-fixed">
          {badge}
        </span>
      )}
    </Link>
  )
}
