import { useState, type FormEvent } from 'react'
import { apiRequest } from '../api'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { SegmentedProgress } from '../components/SegmentedProgress'
import { useChampionship } from '../context/ChampionshipContext'
import type { Team } from '../types'

export function TeamsPage() {
  const {
    championshipId,
    championship,
    teams,
    loading,
    error,
    info,
    setMessage,
    refreshAll,
    run,
  } = useChampionship()
  const [teamForm, setTeamForm] = useState({ name: '', shortName: '' })

  const locked = championship?.status !== 'draft'
  const registered = championship?.registeredTeams ?? 0
  const max = championship?.maxTeams ?? 32

  const addTeam = async (event: FormEvent) => {
    event.preventDefault()
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/teams`, {
        method: 'POST',
        body: JSON.stringify({
          name: teamForm.name,
          shortName: teamForm.shortName || undefined,
        }),
      })
      setTeamForm({ name: '', shortName: '' })
      await refreshAll()
      setMessage('info', 'Equipo agregado')
    })
  }

  const renameTeam = async (team: Team) => {
    const nextName = window.prompt('Nuevo nombre del equipo', team.name)?.trim()
    if (!nextName || nextName === team.name) return
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/teams/${team.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: nextName, shortName: team.shortName ?? undefined }),
      })
      await refreshAll()
      setMessage('info', 'Equipo actualizado')
    })
  }

  const removeTeam = async (team: Team) => {
    if (!window.confirm(`Eliminar ${team.name}?`)) return
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/teams/${team.id}`, {
        method: 'DELETE',
      })
      await refreshAll()
      setMessage('info', 'Equipo eliminado')
    })
  }

  return (
    <div>
      <Banner error={error} info={info} />

      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="mb-2 block font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Administración de Participantes
          </span>
          <h1 className="mb-2 font-headline text-3xl font-bold text-on-surface">
            Inscripción de Equipos
          </h1>
          <p className="max-w-xl text-on-secondary-container">
            Registro oficial del campeonato. Validá acrónimos (shortName) para el sistema de
            transmisión.
          </p>
        </div>
        <div className="min-w-[280px] rounded-lg border border-outline-variant bg-white p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-headline text-2xl font-semibold text-on-surface">
              {registered} <span className="text-lg text-on-surface-variant">/ {max}</span>
            </span>
            <span className="bg-surface-container-highest px-2 py-1 font-label text-xs text-primary">
              {Math.round((registered / max) * 100)}% COMPLETADO
            </span>
          </div>
          <SegmentedProgress value={registered} max={max} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <section className="xl:col-span-5">
          <div className="rounded-lg border border-outline-variant bg-white p-8">
            <h3 className="mb-6 flex items-center gap-3 font-headline text-xl font-semibold">
              <Icon name="add_circle" className="text-primary" filled />
              Alta de Equipo
            </h3>
            <form className="space-y-4" onSubmit={addTeam}>
              <div>
                <label className="mb-1 block font-label text-xs uppercase text-on-surface-variant">
                  Nombre
                </label>
                <input
                  className="w-full border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Boca Juniors"
                  required
                  disabled={loading || locked}
                />
              </div>
              <div>
                <label className="mb-1 block font-label text-xs uppercase text-on-surface-variant">
                  ShortName
                </label>
                <input
                  className="w-full border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
                  value={teamForm.shortName}
                  onChange={(e) =>
                    setTeamForm((prev) => ({ ...prev, shortName: e.target.value.toUpperCase() }))
                  }
                  placeholder="BOC"
                  maxLength={10}
                  disabled={loading || locked}
                />
              </div>
              <button
                type="submit"
                disabled={loading || locked}
                className="w-full rounded-lg bg-primary py-3 font-bold text-white disabled:opacity-50"
              >
                Registrar Equipo
              </button>
              {locked && (
                <p className="text-sm text-error">
                  La inscripción está cerrada. No se pueden modificar equipos.
                </p>
              )}
            </form>
          </div>
        </section>

        <section className="xl:col-span-7">
          <div className="overflow-hidden rounded-lg border border-outline-variant bg-white">
            <div className="border-b border-outline-variant bg-on-surface px-6 py-4">
              <h3 className="font-headline text-lg font-semibold text-white">Listado ({teams.length})</h3>
            </div>
            <ul className="divide-y divide-outline-variant">
              {teams.length === 0 && (
                <li className="px-6 py-10 text-on-surface-variant">Sin equipos todavía.</li>
              )}
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-on-surface font-label text-xs text-primary-fixed">
                      {(team.shortName ?? team.name.slice(0, 3)).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{team.name}</p>
                      <p className="font-label text-xs text-on-surface-variant">
                        {team.shortName ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={loading || locked}
                      onClick={() => void renameTeam(team)}
                      className="rounded border border-outline-variant px-3 py-1 text-sm font-bold disabled:opacity-40"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={loading || locked}
                      onClick={() => void removeTeam(team)}
                      className="rounded border border-error/30 px-3 py-1 text-sm font-bold text-error disabled:opacity-40"
                    >
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
