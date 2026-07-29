import type { Championship, RecentChampionship } from '../types'

const STORAGE_KEY = 'futbolya.recentChampionships'

export function loadRecents(): RecentChampionship[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentChampionship[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function rememberChampionship(championship: Championship): RecentChampionship[] {
  const next: RecentChampionship = {
    id: championship.id,
    name: championship.name,
    season: championship.season,
    status: championship.status,
    registeredTeams: championship.registeredTeams,
    maxTeams: championship.maxTeams,
    updatedAt: new Date().toISOString(),
  }

  const others = loadRecents().filter((item) => item.id !== championship.id)
  const merged = [next, ...others].slice(0, 12)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  return merged
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'INSCRIPCIÓN ABIERTA'
    case 'registration-closed':
      return 'INSCRIPCIÓN CERRADA'
    case 'drawn':
      return 'SORTEADO'
    case 'in-progress':
      return 'EN JUEGO'
    case 'finished':
      return 'FINALIZADO'
    default:
      return status.toUpperCase()
  }
}

export function statusTone(status: string): 'green' | 'blue' | 'yellow' | 'red' | 'gray' {
  switch (status) {
    case 'draft':
      return 'blue'
    case 'registration-closed':
      return 'yellow'
    case 'drawn':
      return 'green'
    case 'in-progress':
      return 'green'
    case 'finished':
      return 'red'
    default:
      return 'gray'
  }
}

/** Maps API status to phase stepper index 0..4 */
export function phaseIndex(status: string): number {
  switch (status) {
    case 'draft':
      return 0
    case 'registration-closed':
      return 1
    case 'drawn':
      return 2
    case 'in-progress':
      return 3
    case 'finished':
      return 4
    default:
      return 0
  }
}

export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  const months = [
    'ENE',
    'FEB',
    'MAR',
    'ABR',
    'MAY',
    'JUN',
    'JUL',
    'AGO',
    'SEP',
    'OCT',
    'NOV',
    'DIC',
  ]
  return `${Number(day)} ${months[Number(month) - 1]}`
}
