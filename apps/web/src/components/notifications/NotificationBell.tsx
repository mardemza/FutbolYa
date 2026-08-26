import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { formatBadgeCount } from '../../lib/notificationUi'
import { Icon } from '../Icon'

export function NotificationBell() {
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const badge = unreadCount > 0 ? formatBadgeCount(unreadCount) : null

  return (
    <button
      type="button"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} notificaciones sin leer`
          : 'Notificaciones'
      }
      onClick={() => navigate('/notifications')}
      className="relative flex items-center justify-center rounded-lg p-1 text-primary-fixed transition-colors hover:bg-white/10"
    >
      <Icon name="notifications" className="text-2xl" />
      {badge && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1 font-label text-[10px] font-bold text-on-primary-fixed">
          {badge}
        </span>
      )}
    </button>
  )
}
