import { loadSession } from './lib/authStorage'

const API_PREFIX = '/api/v1'

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const session = loadSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }

  if (session?.accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${session.accessToken}`
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const payload = (await response.json()) as {
        message?: string | string[]
        details?: { message?: string | string[] }
      }
      if (Array.isArray(payload.message)) {
        message = payload.message.join(', ')
      } else if (typeof payload.message === 'string') {
        message = payload.message
      } else if (Array.isArray(payload.details?.message)) {
        message = payload.details.message.join(', ')
      } else if (typeof payload.details?.message === 'string') {
        message = payload.details.message
      }
    } catch {
      // keep fallback
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
