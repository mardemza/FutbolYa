import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Championship = {
  id: string
  name: string
  season: string
  startDate: string
  status: string
  maxTeams: number
  registeredTeams: number
}

type Team = {
  id: string
  name: string
  shortName: string | null
}

type Group = {
  id: string
  name: string
  teams: Team[]
}

type Match = {
  id: string
  stageType: 'group' | 'knockout'
  roundName: string | null
  groupId: string | null
  matchday: number | null
  homeTeamId: string
  awayTeamId: string
  homeGoals: number | null
  awayGoals: number | null
  status: 'scheduled' | 'played'
}

type Standing = {
  teamId: string
  position: number
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

const API_PREFIX = '/api/v1'

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
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
      // ignore parse errors and keep fallback message
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function App() {
  const [championshipId, setChampionshipId] = useState('')
  const [championship, setChampionship] = useState<Championship | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groupMatches, setGroupMatches] = useState<Match[]>([])
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([])
  const [standingsByGroup, setStandingsByGroup] = useState<Record<string, Standing[]>>({})
  const [seed, setSeed] = useState('futbolya-seed')

  const [form, setForm] = useState({
    name: 'Copa FutbolYa',
    season: '2026',
    startDate: '2026-08-01',
  })
  const [teamForm, setTeamForm] = useState({ name: '', shortName: '' })
  const [resultDrafts, setResultDrafts] = useState<Record<string, { home: string; away: string }>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const teamById = useMemo(() => {
    return new Map(teams.map((team) => [team.id, team]))
  }, [teams])

  const canOperate = Boolean(championshipId)

  const setMessage = (kind: 'error' | 'info', message: string) => {
    if (kind === 'error') {
      setError(message)
      setInfo('')
      return
    }
    setInfo(message)
    setError('')
  }

  const run = async (work: () => Promise<void>) => {
    setLoading(true)
    try {
      await work()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setMessage('error', message)
    } finally {
      setLoading(false)
    }
  }

  const refreshAll = async (id: string) => {
    const [champ, loadedTeams, loadedGroups, loadedGroupMatches, loadedKnockout] =
      await Promise.all([
        apiRequest<Championship>(`/championships/${id}`),
        apiRequest<Team[]>(`/championships/${id}/teams`),
        apiRequest<Group[]>(`/championships/${id}/groups`),
        apiRequest<Match[]>(`/championships/${id}/matches?stageType=group`),
        apiRequest<Match[]>(`/championships/${id}/matches?stageType=knockout`),
      ])

    setChampionship(champ)
    setTeams(loadedTeams)
    setGroups(loadedGroups)
    setGroupMatches(loadedGroupMatches)
    setKnockoutMatches(loadedKnockout)
  }

  const createChampionship = async (event: FormEvent) => {
    event.preventDefault()
    await run(async () => {
      const created = await apiRequest<Championship>('/championships', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setChampionshipId(created.id)
      await refreshAll(created.id)
      setMessage('info', 'Campeonato creado')
    })
  }

  const loadExisting = async () => {
    if (!championshipId) {
      setMessage('error', 'Ingresa un ID de campeonato para cargar')
      return
    }
    await run(async () => {
      await refreshAll(championshipId)
      setMessage('info', 'Campeonato cargado')
    })
  }

  const addTeam = async (event: FormEvent) => {
    event.preventDefault()
    if (!championshipId) {
      setMessage('error', 'Primero crea o carga un campeonato')
      return
    }
    await run(async () => {
      await apiRequest<Team>(`/championships/${championshipId}/teams`, {
        method: 'POST',
        body: JSON.stringify({
          name: teamForm.name,
          shortName: teamForm.shortName || undefined,
        }),
      })
      setTeamForm({ name: '', shortName: '' })
      await refreshAll(championshipId)
      setMessage('info', 'Equipo agregado')
    })
  }

  const closeRegistration = async () => {
    if (!championshipId) return
    await run(async () => {
      await apiRequest<Championship>(
        `/championships/${championshipId}/close-registration`,
        { method: 'POST' },
      )
      await refreshAll(championshipId)
      setMessage('info', 'Inscripción cerrada')
    })
  }

  const drawGroups = async () => {
    if (!championshipId) return
    await run(async () => {
      await apiRequest<Group[]>(`/championships/${championshipId}/draw`, {
        method: 'POST',
        body: JSON.stringify({ seed }),
      })
      await refreshAll(championshipId)
      setMessage('info', 'Sorteo generado')
    })
  }

  const generateFixtures = async () => {
    if (!championshipId) return
    await run(async () => {
      await apiRequest<{ createdMatches: number }>(`/championships/${championshipId}/fixtures`, {
        method: 'POST',
      })
      await refreshAll(championshipId)
      setMessage('info', 'Fixture generado')
    })
  }

  const setResult = async (matchId: string, homeGoals: number, awayGoals: number) => {
    await apiRequest<Match>(`/matches/${matchId}/result`, {
      method: 'PUT',
      body: JSON.stringify({ homeGoals, awayGoals }),
    })
  }

  const renameTeam = async (team: Team) => {
    if (!championshipId) return

    const nextName = window.prompt('Nuevo nombre del equipo', team.name)?.trim()
    if (!nextName || nextName === team.name) {
      return
    }

    await run(async () => {
      await apiRequest<Team>(`/championships/${championshipId}/teams/${team.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: nextName, shortName: team.shortName ?? undefined }),
      })
      await refreshAll(championshipId)
      setMessage('info', 'Equipo actualizado')
    })
  }

  const removeTeam = async (team: Team) => {
    if (!championshipId) return

    const confirmed = window.confirm(`Eliminar ${team.name}? Esta acción no se puede deshacer.`)
    if (!confirmed) {
      return
    }

    await run(async () => {
      await apiRequest<void>(`/championships/${championshipId}/teams/${team.id}`, {
        method: 'DELETE',
      })
      await refreshAll(championshipId)
      setMessage('info', 'Equipo eliminado')
    })
  }

  const updateResultDraft = (matchId: string, side: 'home' | 'away', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) {
      return
    }

    setResultDrafts((prev) => ({
      ...prev,
      [matchId]: {
        home: prev[matchId]?.home ?? '',
        away: prev[matchId]?.away ?? '',
        [side]: value,
      },
    }))
  }

  const submitManualResult = async (match: Match) => {
    if (!championshipId) return

    const draft = resultDrafts[match.id]
    const home = draft?.home ?? ''
    const away = draft?.away ?? ''
    if (home === '' || away === '') {
      setMessage('error', 'Completa ambos goles para guardar resultado')
      return
    }

    await run(async () => {
      await setResult(match.id, Number(home), Number(away))
      await refreshAll(championshipId)
      if (groups.length > 0) {
        const entries = await Promise.all(
          groups.map(async (group) => {
            const table = await apiRequest<Standing[]>(
              `/championships/${championshipId}/groups/${group.id}/standings`,
            )
            return [group.id, table] as const
          }),
        )
        setStandingsByGroup(Object.fromEntries(entries))
      }
      setResultDrafts((prev) => {
        const next = { ...prev }
        delete next[match.id]
        return next
      })
      setMessage('info', 'Resultado guardado')
    })
  }

  const simulateGroupResults = async () => {
    if (!championshipId) return
    await run(async () => {
      for (const match of groupMatches) {
        if (match.status !== 'played') {
          await setResult(match.id, 1, 0)
        }
      }
      await refreshAll(championshipId)
      setMessage('info', 'Resultados de grupos cargados')
    })
  }

  const loadStandings = async () => {
    if (!championshipId || groups.length === 0) return
    await run(async () => {
      const entries = await Promise.all(
        groups.map(async (group) => {
          const table = await apiRequest<Standing[]>(
            `/championships/${championshipId}/groups/${group.id}/standings`,
          )
          return [group.id, table] as const
        }),
      )
      setStandingsByGroup(Object.fromEntries(entries))
      setMessage('info', 'Tablas actualizadas')
    })
  }

  const generateKnockout = async () => {
    if (!championshipId) return
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/stages/knockout/generate`, {
        method: 'POST',
      })
      await refreshAll(championshipId)
      setMessage('info', 'Cuadro knockout generado')
    })
  }

  return (
    <div className="app-shell">
      <header className="top">
        <div>
          <p className="eyebrow">FutbolYa</p>
          <h1>Panel de Campeonato 32</h1>
          <p className="subtitle">Flujo completo integrado con la API en /api/v1.</p>
        </div>
        <div className="status-box">
          <span className="label">Estado</span>
          <strong>{championship?.status ?? 'sin campeonato cargado'}</strong>
          <span>
            {championship?.registeredTeams ?? 0} / {championship?.maxTeams ?? 32} equipos
          </span>
        </div>
      </header>

      {(error || info) && (
        <div className={`banner ${error ? 'banner-error' : 'banner-info'}`}>
          {error || info}
        </div>
      )}

      <section className="grid two">
        <article className="card">
          <h2>Crear Campeonato</h2>
          <form className="form" onSubmit={createChampionship}>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Nombre"
              required
            />
            <input
              value={form.season}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, season: event.target.value }))
              }
              placeholder="Temporada"
              required
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              required
            />
            <button disabled={loading} type="submit">
              Crear
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Cargar Existente</h2>
          <div className="form inline">
            <input
              value={championshipId}
              onChange={(event) => setChampionshipId(event.target.value)}
              placeholder="championshipId"
            />
            <button disabled={loading} type="button" onClick={loadExisting}>
              Cargar
            </button>
            <button
              disabled={loading || !championshipId}
              type="button"
              className="ghost"
              onClick={() => run(async () => refreshAll(championshipId))}
            >
              Refrescar
            </button>
          </div>
          {championship && (
            <dl className="meta">
              <dt>ID</dt>
              <dd>{championship.id}</dd>
              <dt>Nombre</dt>
              <dd>{championship.name}</dd>
              <dt>Season</dt>
              <dd>{championship.season}</dd>
            </dl>
          )}
        </article>
      </section>

      <section className="grid two">
        <article className="card">
          <h2>Equipos</h2>
          <form className="form inline" onSubmit={addTeam}>
            <input
              value={teamForm.name}
              onChange={(event) =>
                setTeamForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Nombre equipo"
              required
              disabled={!canOperate}
            />
            <input
              value={teamForm.shortName}
              onChange={(event) =>
                setTeamForm((prev) => ({ ...prev, shortName: event.target.value }))
              }
              placeholder="Sigla"
              disabled={!canOperate}
            />
            <button disabled={loading || !canOperate} type="submit">
              Agregar
            </button>
          </form>
          <div className="team-list">
            {teams.map((team) => (
              <div className="team-row" key={team.id}>
                <span className="pill">{team.name}</span>
                <div className="team-row-actions">
                  <button
                    disabled={loading || !canOperate}
                    type="button"
                    className="mini ghost"
                    onClick={() => void renameTeam(team)}
                  >
                    Editar
                  </button>
                  <button
                    disabled={loading || !canOperate}
                    type="button"
                    className="mini danger"
                    onClick={() => void removeTeam(team)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Fases</h2>
          <div className="actions">
            <button disabled={loading || !canOperate} onClick={closeRegistration} type="button">
              Cerrar inscripción
            </button>
            <div className="inline">
              <input value={seed} onChange={(event) => setSeed(event.target.value)} />
              <button disabled={loading || !canOperate} onClick={drawGroups} type="button">
                Sortear grupos
              </button>
            </div>
            <button disabled={loading || !canOperate} onClick={generateFixtures} type="button">
              Generar fixture
            </button>
            <button
              disabled={loading || !canOperate || groupMatches.length === 0}
              onClick={simulateGroupResults}
              type="button"
            >
              Simular resultados (1-0)
            </button>
            <button disabled={loading || !canOperate || groups.length === 0} onClick={loadStandings} type="button">
              Cargar tablas
            </button>
            <button
              disabled={loading || !canOperate || groupMatches.length === 0}
              onClick={generateKnockout}
              type="button"
            >
              Generar knockout
            </button>
          </div>
        </article>
      </section>

      <section className="grid two">
        <article className="card">
          <h2>Grupos</h2>
          {groups.length === 0 && <p className="hint">Sin grupos sorteados todavía.</p>}
          <div className="group-grid">
            {groups.map((group) => (
              <div key={group.id} className="group-card">
                <h3>Grupo {group.name}</h3>
                <ul>
                  {group.teams?.map((team) => (
                    <li key={team.id}>{team.name}</li>
                  ))}
                </ul>
                {standingsByGroup[group.id] && (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Equipo</th>
                        <th>Pts</th>
                        <th>DG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standingsByGroup[group.id].map((row) => (
                        <tr key={row.teamId}>
                          <td>{row.position}</td>
                          <td>{teamById.get(row.teamId)?.name ?? row.teamId.slice(0, 8)}</td>
                          <td>{row.points}</td>
                          <td>{row.goalDifference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Partidos</h2>
          <h3>Fase de grupos: {groupMatches.length}</h3>
          <div className="match-list">
            {groupMatches.map((match) => (
              <div key={match.id} className="match-row">
                <span>{teamById.get(match.homeTeamId)?.name ?? match.homeTeamId.slice(0, 8)}</span>
                <strong>
                  {match.homeGoals ?? '-'} : {match.awayGoals ?? '-'}
                </strong>
                <span>{teamById.get(match.awayTeamId)?.name ?? match.awayTeamId.slice(0, 8)}</span>
                <div className="result-editor">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={match.homeGoals?.toString() ?? 'H'}
                    value={resultDrafts[match.id]?.home ?? ''}
                    onChange={(event) => updateResultDraft(match.id, 'home', event.target.value)}
                    disabled={loading}
                  />
                  <span>:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={match.awayGoals?.toString() ?? 'A'}
                    value={resultDrafts[match.id]?.away ?? ''}
                    onChange={(event) => updateResultDraft(match.id, 'away', event.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="mini"
                    disabled={loading}
                    onClick={() => void submitManualResult(match)}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h3>Knockout: {knockoutMatches.length}</h3>
          <div className="match-list">
            {knockoutMatches.map((match) => (
              <div key={match.id} className="match-row">
                <span>{teamById.get(match.homeTeamId)?.name ?? match.homeTeamId.slice(0, 8)}</span>
                <strong>
                  {match.homeGoals ?? '-'} : {match.awayGoals ?? '-'}
                </strong>
                <span>{teamById.get(match.awayTeamId)?.name ?? match.awayTeamId.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

export default App
