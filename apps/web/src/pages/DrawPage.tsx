import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { useChampionship } from '../context/ChampionshipContext'

export function DrawPage() {
  const {
    championshipId,
    championship,
    groups,
    groupMatches,
    loading,
    error,
    info,
    setMessage,
    refreshAll,
    run,
  } = useChampionship()
  const [seed, setSeed] = useState('futbolya-seed')

  const closeRegistration = async () => {
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/close-registration`, { method: 'POST' })
      await refreshAll()
      setMessage('info', 'Inscripción cerrada')
    })
  }

  const drawGroups = async () => {
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/draw`, {
        method: 'POST',
        body: JSON.stringify({ seed: seed || undefined }),
      })
      await refreshAll()
      setMessage('info', 'Sorteo generado')
    })
  }

  const generateFixtures = async () => {
    await run(async () => {
      await apiRequest(`/championships/${championshipId}/fixtures`, { method: 'POST' })
      await refreshAll()
      setMessage('info', 'Fixture generado')
    })
  }

  const canClose =
    championship?.status === 'draft' &&
    championship.registeredTeams === championship.maxTeams
  const canDraw = championship?.status === 'registration-closed'
  const canFixture = championship?.status === 'drawn' && groupMatches.length === 0

  return (
    <div className="space-y-gutter">
      <Banner error={error} info={info} />

      <div>
        <span className="mb-2 block font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
          Operaciones de Fase
        </span>
        <h1 className="font-headline text-3xl font-bold">Sorteo de Grupos</h1>
        <p className="mt-2 max-w-2xl text-on-secondary-container">
          Cerrá inscripción con 32 equipos, ejecutá el sorteo (seed opcional) y generá el calendario
          de 48 partidos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="rounded-lg border border-outline-variant bg-white p-6">
          <h3 className="mb-2 font-headline text-lg font-semibold">1. Cerrar inscripción</h3>
          <p className="mb-4 text-sm text-on-surface-variant">
            Requiere {championship?.maxTeams ?? 32}/{championship?.maxTeams ?? 32} equipos.
          </p>
          <button
            type="button"
            disabled={loading || !canClose}
            onClick={() => void closeRegistration()}
            className="w-full rounded-lg bg-primary py-3 font-bold text-white disabled:opacity-40"
          >
            Cerrar inscripción
          </button>
        </div>

        <div className="rounded-lg border border-outline-variant bg-white p-6">
          <h3 className="mb-2 font-headline text-lg font-semibold">2. Ejecutar sorteo</h3>
          <label className="mb-1 block font-label text-xs uppercase text-on-surface-variant">
            Seed (opcional)
          </label>
          <input
            className="mb-4 w-full border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            disabled={loading || !canDraw}
            onClick={() => void drawGroups()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-bold text-on-primary-fixed disabled:opacity-40"
          >
            <Icon name="casino" />
            Sortear grupos
          </button>
        </div>

        <div className="rounded-lg border border-outline-variant bg-white p-6">
          <h3 className="mb-2 font-headline text-lg font-semibold">3. Generar fixture</h3>
          <p className="mb-4 text-sm text-on-surface-variant">
            Crea los 48 partidos de fase de grupos. No se puede regenerar.
          </p>
          <button
            type="button"
            disabled={loading || !canFixture}
            onClick={() => void generateFixtures()}
            className="w-full rounded-lg border-2 border-on-surface py-3 font-bold disabled:opacity-40"
          >
            Generar fixture
          </button>
          {groupMatches.length > 0 && (
            <Link
              to={`/championships/${championshipId}/fixture`}
              className="mt-3 block text-center font-bold text-primary"
            >
              Ir al fixture →
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-headline text-2xl font-semibold uppercase">Grupos</h2>
        {groups.length === 0 ? (
          <p className="text-on-surface-variant">Sin grupos sorteados todavía.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="rounded-lg border border-outline-variant bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between border-b border-outline-variant pb-2">
                  <h3 className="font-headline text-lg font-bold text-primary">
                    Grupo {group.name}
                  </h3>
                  <span className="font-label text-xs text-on-surface-variant">4 equipos</span>
                </div>
                <ul className="space-y-2">
                  {group.teams?.map((team) => (
                    <li key={team.id} className="flex items-center gap-2 text-sm">
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-on-surface font-label text-[10px] text-primary-fixed">
                        {(team.shortName ?? team.name.slice(0, 3)).toUpperCase()}
                      </span>
                      <span className="font-medium">{team.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
