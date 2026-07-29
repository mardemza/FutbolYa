import { useMemo, useState } from 'react'
import { apiRequest } from '../api'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { useChampionship } from '../context/ChampionshipContext'
import type { Match } from '../types'

export function FixturePage() {
  const {
    groups,
    groupMatches,
    teamById,
    loading,
    error,
    info,
    setMessage,
    refreshAll,
    loadStandings,
    run,
  } = useChampionship()
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [resultDrafts, setResultDrafts] = useState<
    Record<string, { home: string; away: string }>
  >({})

  const filtered = useMemo(() => {
    if (selectedGroup === 'all') return groupMatches
    return groupMatches.filter((match) => match.groupId === selectedGroup)
  }, [groupMatches, selectedGroup])

  const updateDraft = (matchId: string, side: 'home' | 'away', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return
    setResultDrafts((prev) => ({
      ...prev,
      [matchId]: {
        home: prev[matchId]?.home ?? '',
        away: prev[matchId]?.away ?? '',
        [side]: value,
      },
    }))
  }

  const submitResult = async (match: Match) => {
    const draft = resultDrafts[match.id]
    const home = draft?.home ?? ''
    const away = draft?.away ?? ''
    if (home === '' || away === '') {
      setMessage('error', 'Completá ambos goles')
      return
    }
    await run(async () => {
      await apiRequest(`/matches/${match.id}/result`, {
        method: 'PUT',
        body: JSON.stringify({ homeGoals: Number(home), awayGoals: Number(away) }),
      })
      await refreshAll()
      await loadStandings()
      setResultDrafts((prev) => {
        const next = { ...prev }
        delete next[match.id]
        return next
      })
      setMessage('info', 'Resultado guardado')
    })
  }

  return (
    <div className="space-y-gutter">
      <Banner error={error} info={info} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="mb-2 block font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Calendario
          </span>
          <h1 className="font-headline text-3xl font-bold">Fixture de Grupos</h1>
          <p className="mt-2 text-on-secondary-container">
            {groupMatches.length} partidos · Cargá resultados para actualizar tablas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedGroup('all')}
            className={[
              'rounded px-3 py-2 font-label text-xs uppercase',
              selectedGroup === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface-container-highest text-on-surface',
            ].join(' ')}
          >
            Todos
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroup(group.id)}
              className={[
                'rounded px-3 py-2 font-label text-xs uppercase',
                selectedGroup === group.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-highest text-on-surface',
              ].join(' ')}
            >
              Grupo {group.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-on-surface-variant">Sin partidos. Generá el fixture desde Sorteo.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((match) => {
            const home = teamById.get(match.homeTeamId)
            const away = teamById.get(match.awayTeamId)
            const groupName = groups.find((g) => g.id === match.groupId)?.name
            return (
              <div
                key={match.id}
                className="grid grid-cols-1 items-center gap-3 rounded-lg border border-outline-variant bg-white px-4 py-3 md:grid-cols-[1fr_auto_1fr_auto] md:gap-4 md:px-6"
              >
                <div className="flex items-center justify-end gap-3 md:justify-end">
                  <span className="font-semibold">{home?.name ?? match.homeTeamId.slice(0, 8)}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-on-surface font-label text-[10px] text-primary-fixed">
                    {(home?.shortName ?? 'LOC').slice(0, 3).toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 rounded bg-on-surface px-3 py-2 font-label text-lg text-primary-fixed">
                    <input
                      className="w-10 bg-transparent text-center outline-none"
                      inputMode="numeric"
                      placeholder={String(match.homeGoals ?? 0)}
                      value={resultDrafts[match.id]?.home ?? ''}
                      onChange={(e) => updateDraft(match.id, 'home', e.target.value)}
                      disabled={loading}
                    />
                    <span>:</span>
                    <input
                      className="w-10 bg-transparent text-center outline-none"
                      inputMode="numeric"
                      placeholder={String(match.awayGoals ?? 0)}
                      value={resultDrafts[match.id]?.away ?? ''}
                      onChange={(e) => updateDraft(match.id, 'away', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <span className="font-label text-[10px] uppercase text-on-surface-variant">
                    {match.status === 'played' ? 'Finalizado' : 'Pendiente'}
                    {groupName ? ` · G${groupName}` : ''}
                    {match.matchday != null ? ` · F${match.matchday}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-on-surface font-label text-[10px] text-primary-fixed">
                    {(away?.shortName ?? 'VIS').slice(0, 3).toUpperCase()}
                  </span>
                  <span className="font-semibold">{away?.name ?? match.awayTeamId.slice(0, 8)}</span>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void submitResult(match)}
                  className="flex items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Icon name="save" className="text-base" />
                  Guardar
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
