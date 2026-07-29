import { useMemo } from 'react'
import { apiRequest } from '../api'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { useChampionship } from '../context/ChampionshipContext'

export function BracketPage() {
  const {
    championshipId,
    groupMatches,
    knockoutMatches,
    teamById,
    loading,
    error,
    info,
    setMessage,
    refreshAll,
    run,
  } = useChampionship()

  const pendingGroup = groupMatches.filter((m) => m.status !== 'played').length
  const canGenerate = groupMatches.length > 0 && pendingGroup === 0 && knockoutMatches.length === 0

  const byRound = useMemo(() => {
    const map = new Map<string, typeof knockoutMatches>()
    for (const match of knockoutMatches) {
      const key = match.roundName ?? 'Eliminatoria'
      const list = map.get(key) ?? []
      list.push(match)
      map.set(key, list)
    }
    return Array.from(map.entries())
  }, [knockoutMatches])

  const generateKnockout = async () => {
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/stages/knockout/generate`, {
        method: 'POST',
      })
      await refreshAll()
      setMessage('info', 'Cuadro knockout generado')
    })
  }

  return (
    <div className="space-y-gutter">
      <Banner error={error} info={info} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="mb-2 block font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Eliminación directa
          </span>
          <h1 className="font-headline text-3xl font-bold">Fase Eliminatoria</h1>
          <p className="mt-2 max-w-2xl text-on-secondary-container">
            Generá el bracket cuando todos los partidos de grupos estén finalizados.
          </p>
        </div>
        <button
          type="button"
          disabled={loading || !canGenerate}
          onClick={() => void generateKnockout()}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-white disabled:opacity-40"
        >
          <Icon name="account_tree" />
          Generar knockout
        </button>
      </div>

      {pendingGroup > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          Hay {pendingGroup} partidos de grupos pendientes. El avance a playoffs está bloqueado.
        </div>
      )}

      {knockoutMatches.length === 0 ? (
        <p className="text-on-surface-variant">Todavía no hay cuadro eliminatorio.</p>
      ) : (
        <div className="space-y-8 overflow-x-auto">
          {byRound.map(([round, matches]) => (
            <section key={round}>
              <h2 className="mb-4 font-headline text-xl font-semibold uppercase text-primary">
                {round}
              </h2>
              <div className="grid min-w-[640px] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {matches.map((match) => {
                  const home = teamById.get(match.homeTeamId)
                  const away = teamById.get(match.awayTeamId)
                  return (
                    <div
                      key={match.id}
                      className="rounded-lg border border-outline-variant bg-white p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-label text-[10px] uppercase text-on-surface-variant">
                          {match.status === 'played' ? 'Finalizado' : 'Programado'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">
                            {home?.name ?? match.homeTeamId.slice(0, 8)}
                          </span>
                          <span className="rounded bg-on-surface px-2 py-1 font-label text-primary-fixed">
                            {match.homeGoals ?? '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">
                            {away?.name ?? match.awayTeamId.slice(0, 8)}
                          </span>
                          <span className="rounded bg-on-surface px-2 py-1 font-label text-primary-fixed">
                            {match.awayGoals ?? '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
