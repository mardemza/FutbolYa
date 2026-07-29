import { useEffect, useState } from 'react'
import { Banner } from '../components/Banner'
import { useChampionship } from '../context/ChampionshipContext'

export function StandingsPage() {
  const {
    groups,
    standingsByGroup,
    teamById,
    loading,
    error,
    info,
    loadStandings,
    run,
    setMessage,
  } = useChampionship()
  const [activeGroupId, setActiveGroupId] = useState<string>('')

  useEffect(() => {
    if (groups.length === 0) return
    if (!activeGroupId || !groups.some((g) => g.id === activeGroupId)) {
      setActiveGroupId(groups[0].id)
    }
  }, [groups, activeGroupId])

  useEffect(() => {
    if (groups.length === 0) return
    void run(async () => {
      await loadStandings()
      setMessage('info', 'Tablas actualizadas')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.length])

  const table = activeGroupId ? standingsByGroup[activeGroupId] ?? [] : []
  const activeGroup = groups.find((g) => g.id === activeGroupId)

  return (
    <div className="space-y-gutter">
      <Banner error={error} info={info} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="mb-2 block font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Clasificación
          </span>
          <h1 className="font-headline text-3xl font-bold">Tablas de Posiciones</h1>
        </div>
        <button
          type="button"
          disabled={loading || groups.length === 0}
          onClick={() =>
            void run(async () => {
              await loadStandings()
              setMessage('info', 'Tablas actualizadas')
            })
          }
          className="rounded-lg border-2 border-on-surface px-4 py-2 font-bold disabled:opacity-40"
        >
          Recalcular
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-on-surface-variant">Todavía no hay grupos sorteados.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroupId(group.id)}
                className={[
                  'rounded px-4 py-2 font-label text-xs uppercase tracking-wider',
                  activeGroupId === group.id
                    ? 'bg-on-surface text-primary-fixed'
                    : 'bg-surface-container-highest text-on-surface',
                ].join(' ')}
              >
                Grupo {group.name}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-outline-variant bg-white">
            <div className="bg-on-surface px-6 py-4">
              <h2 className="font-headline text-xl font-semibold text-white">
                Grupo {activeGroup?.name ?? '—'}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-on-surface font-label text-xs uppercase tracking-wider text-white">
                    <th className="px-4 py-3">Pos</th>
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-4 py-3 text-center">PJ</th>
                    <th className="px-4 py-3 text-center">PG</th>
                    <th className="px-4 py-3 text-center">PE</th>
                    <th className="px-4 py-3 text-center">PP</th>
                    <th className="px-4 py-3 text-center">GF</th>
                    <th className="px-4 py-3 text-center">GC</th>
                    <th className="px-4 py-3 text-center">DG</th>
                    <th className="px-4 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {table.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-on-surface-variant">
                        Sin datos de tabla todavía.
                      </td>
                    </tr>
                  )}
                  {table.map((row) => (
                    <tr key={row.teamId} className="hover:bg-surface-container-low">
                      <td className="px-4 py-3 font-label text-sm">{row.position}</td>
                      <td className="px-4 py-3 font-semibold">
                        {teamById.get(row.teamId)?.name ?? row.teamId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-center font-label text-sm">{row.played}</td>
                      <td className="px-4 py-3 text-center font-label text-sm">{row.won}</td>
                      <td className="px-4 py-3 text-center font-label text-sm">{row.drawn}</td>
                      <td className="px-4 py-3 text-center font-label text-sm">{row.lost}</td>
                      <td className="px-4 py-3 text-center font-label text-sm">{row.goalsFor}</td>
                      <td className="px-4 py-3 text-center font-label text-sm">
                        {row.goalsAgainst}
                      </td>
                      <td className="px-4 py-3 text-center font-label text-sm">
                        {row.goalDifference}
                      </td>
                      <td className="px-4 py-3 text-center font-label text-sm font-bold text-primary">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
