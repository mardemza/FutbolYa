import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams } from 'react-router-dom'
import { apiRequest } from '../api'
import { rememberChampionship } from '../lib/championshipUi'
import type { Championship, Group, Match, Standing, Team } from '../types'

type ChampionshipContextValue = {
  championshipId: string
  championship: Championship | null
  teams: Team[]
  groups: Group[]
  groupMatches: Match[]
  knockoutMatches: Match[]
  standingsByGroup: Record<string, Standing[]>
  loading: boolean
  error: string
  info: string
  setMessage: (kind: 'error' | 'info', message: string) => void
  refreshAll: () => Promise<void>
  loadStandings: () => Promise<void>
  run: (work: () => Promise<void>) => Promise<void>
  teamById: Map<string, Team>
}

const ChampionshipContext = createContext<ChampionshipContextValue | null>(null)

export function ChampionshipProvider({ children }: { children: ReactNode }) {
  const { championshipId = '' } = useParams()
  const [championship, setChampionship] = useState<Championship | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groupMatches, setGroupMatches] = useState<Match[]>([])
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([])
  const [standingsByGroup, setStandingsByGroup] = useState<Record<string, Standing[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const setMessage = useCallback((kind: 'error' | 'info', message: string) => {
    if (kind === 'error') {
      setError(message)
      setInfo('')
      return
    }
    setInfo(message)
    setError('')
  }, [])

  const refreshAll = useCallback(async () => {
    if (!championshipId) return
    const [champ, loadedTeams, loadedGroups, loadedGroupMatches, loadedKnockout] =
      await Promise.all([
        apiRequest<Championship>(`/championships/${championshipId}`),
        apiRequest<Team[]>(`/championships/${championshipId}/teams`),
        apiRequest<Group[]>(`/championships/${championshipId}/groups`),
        apiRequest<Match[]>(`/championships/${championshipId}/matches?stageType=group`),
        apiRequest<Match[]>(`/championships/${championshipId}/matches?stageType=knockout`),
      ])

    setChampionship(champ)
    setTeams(loadedTeams)
    setGroups(loadedGroups)
    setGroupMatches(loadedGroupMatches)
    setKnockoutMatches(loadedKnockout)
    rememberChampionship(champ)
  }, [championshipId])

  const loadStandings = useCallback(async () => {
    if (!championshipId || groups.length === 0) return
    const entries = await Promise.all(
      groups.map(async (group) => {
        const table = await apiRequest<Standing[]>(
          `/championships/${championshipId}/groups/${group.id}/standings`,
        )
        return [group.id, table] as const
      }),
    )
    setStandingsByGroup(Object.fromEntries(entries))
  }, [championshipId, groups])

  const run = useCallback(
    async (work: () => Promise<void>) => {
      setLoading(true)
      try {
        await work()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        setMessage('error', message)
      } finally {
        setLoading(false)
      }
    },
    [setMessage],
  )

  useEffect(() => {
    if (!championshipId) return
    void run(async () => {
      await refreshAll()
    })
  }, [championshipId, refreshAll, run])

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams])

  const value = useMemo(
    () => ({
      championshipId,
      championship,
      teams,
      groups,
      groupMatches,
      knockoutMatches,
      standingsByGroup,
      loading,
      error,
      info,
      setMessage,
      refreshAll,
      loadStandings,
      run,
      teamById,
    }),
    [
      championshipId,
      championship,
      teams,
      groups,
      groupMatches,
      knockoutMatches,
      standingsByGroup,
      loading,
      error,
      info,
      setMessage,
      refreshAll,
      loadStandings,
      run,
      teamById,
    ],
  )

  return <ChampionshipContext.Provider value={value}>{children}</ChampionshipContext.Provider>
}

export function useChampionship() {
  const ctx = useContext(ChampionshipContext)
  if (!ctx) {
    throw new Error('useChampionship must be used within ChampionshipProvider')
  }
  return ctx
}
