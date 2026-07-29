import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiRequest } from '../api'
import {
  clearSession,
  loadSession,
  saveSession,
  type AuthSession,
  type AuthUser,
} from '../lib/authStorage'

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthResponse = {
  user: AuthUser
  accessToken: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  const persist = useCallback((next: AuthSession | null) => {
    setSession(next)
    if (next) {
      saveSession(next)
    } else {
      clearSession()
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      persist(result)
    },
    [persist],
  )

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const result = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || undefined,
        }),
      })
      persist(result)
    },
    [persist],
  )

  const logout = useCallback(() => {
    persist(null)
  }, [persist])

  const refreshMe = useCallback(async () => {
    if (!session?.accessToken) return
    const user = await apiRequest<AuthUser>('/auth/me')
    persist({ accessToken: session.accessToken, user })
  }, [persist, session?.accessToken])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      login,
      register,
      logout,
      refreshMe,
    }),
    [session, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
