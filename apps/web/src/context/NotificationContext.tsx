import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { fetchUnreadCount } from '../lib/notificationsApi'
import type { NotificationItem, NotificationNewPayload } from '../types/notifications'

type NotificationContextValue = {
  unreadCount: number
  liveItems: NotificationItem[]
  prependLiveNotification: (item: NotificationItem) => void
  clearLiveItems: () => void
  refreshUnreadCount: () => Promise<void>
  markReadLocally: (count?: number) => void
  connected: boolean
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function disconnectSocket(socket: Socket | null) {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [liveItems, setLiveItems] = useState<NotificationItem[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const tokenRef = useRef<string | null>(null)

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }
    const { unreadCount: count } = await fetchUnreadCount()
    setUnreadCount(count)
  }, [isAuthenticated])

  const prependLiveNotification = useCallback((item: NotificationItem) => {
    setLiveItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev
      }
      return [item, ...prev]
    })
  }, [])

  const clearLiveItems = useCallback(() => {
    setLiveItems([])
  }, [])

  const markReadLocally = useCallback((count = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - count))
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setUnreadCount(0)
      setLiveItems([])
      setConnected(false)
      disconnectSocket(socketRef.current)
      socketRef.current = null
      tokenRef.current = null
      return
    }

    void refreshUnreadCount()

    const reuseExisting =
      socketRef.current &&
      tokenRef.current === accessToken &&
      !socketRef.current.disconnected

    const socket =
      reuseExisting
        ? socketRef.current!
        : (() => {
            disconnectSocket(socketRef.current)
            const next = io('/notifications', {
              path: '/socket.io',
              auth: { token: accessToken },
              transports: ['websocket'],
              reconnection: true,
            })
            socketRef.current = next
            tokenRef.current = accessToken
            return next
          })()

    const handleConnect = () => {
      setConnected(true)
      void refreshUnreadCount()
    }

    const handleDisconnect = () => {
      setConnected(false)
    }

    const handleNotification = (payload: NotificationNewPayload) => {
      setUnreadCount(payload.unreadCount)
      prependLiveNotification(payload.notification)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('notification:new', handleNotification)

    if (socket.connected) {
      setConnected(true)
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('notification:new', handleNotification)
    }
  }, [accessToken, isAuthenticated, prependLiveNotification, refreshUnreadCount])

  const value = useMemo(
    () => ({
      unreadCount,
      liveItems,
      prependLiveNotification,
      clearLiveItems,
      refreshUnreadCount,
      markReadLocally,
      connected,
    }),
    [
      unreadCount,
      liveItems,
      prependLiveNotification,
      clearLiveItems,
      refreshUnreadCount,
      markReadLocally,
      connected,
    ],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
