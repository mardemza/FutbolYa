import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { PhaseStepper } from '../components/PhaseStepper'
import { SegmentedProgress } from '../components/SegmentedProgress'
import { useChampionship } from '../context/ChampionshipContext'
import { formatShortDate, phaseIndex, statusLabel } from '../lib/championshipUi'

export function DashboardPage() {
  const { championship, teams, groups, groupMatches, knockoutMatches, loading, error, info, run, refreshAll } =
    useChampionship()

  if (!championship) {
    return (
      <div>
        <Banner error={error} info={info} />
        <p className="text-on-surface-variant">{loading ? 'Cargando…' : 'Campeonato no encontrado.'}</p>
      </div>
    )
  }

  const registered = championship.registeredTeams
  const max = championship.maxTeams
  const canClose = championship.status === 'draft' && registered === max
  const canDraw = championship.status === 'registration-closed'
  const canFixture = championship.status === 'drawn' && groupMatches.length === 0
  const pendingGroup = groupMatches.filter((m) => m.status !== 'played').length

  return (
    <div className="space-y-gutter">
      <Banner error={error} info={info} />

      <div className="flex justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={() => void run(refreshAll)}
          className="flex items-center gap-2 rounded-lg border-2 border-on-surface px-4 py-2 text-sm font-bold"
        >
          <Icon name="refresh" className="text-base" />
          Refrescar
        </button>
      </div>

      <PhaseStepper
        activeIndex={phaseIndex(championship.status)}
        currentLabel={statusLabel(championship.status)}
      />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-6 md:col-span-8">
          <div>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-headline text-2xl font-semibold text-on-surface">
                  Registro de Equipos
                </h3>
                <p className="font-body text-on-surface-variant">
                  Cupos completados para la fase inicial.
                </p>
              </div>
              <div className="text-right">
                <span className="block font-display text-4xl font-extrabold leading-none text-primary">
                  {registered}/{max}
                </span>
                <span className="font-label text-xs text-on-secondary-container">
                  EQUIPOS CONFIRMADOS
                </span>
              </div>
            </div>
            <SegmentedProgress value={registered} max={max} className="mb-8" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/championships/${championship.id}/teams`}
              className="rounded-lg bg-primary-container px-5 py-3 font-bold text-on-primary-fixed"
            >
              + Continuar Inscripción
            </Link>
            <Link
              to={`/championships/${championship.id}/teams`}
              className="rounded-lg border-2 border-on-surface px-5 py-3 font-bold"
            >
              Ver Listado Completo
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 md:col-span-4">
          <div className="mb-4 flex items-center gap-2">
            <Icon
              name={canDraw || canFixture ? 'casino' : 'lock'}
              className={canDraw || canFixture ? 'text-primary' : 'text-on-surface-variant'}
            />
            <h3 className="font-headline text-xl font-semibold">Próximo Paso</h3>
          </div>
          <p className="mb-4 text-sm text-on-surface-variant">
            {championship.status === 'draft' &&
              (canClose
                ? 'Cupo completo: cerrá la inscripción para habilitar el sorteo.'
                : `Faltan ${max - registered} equipos para cerrar inscripción.`)}
            {championship.status === 'registration-closed' &&
              'Listo para sortear los 8 grupos.'}
            {championship.status === 'drawn' &&
              (groupMatches.length === 0
                ? 'Generá el fixture de fase de grupos.'
                : 'Cargá resultados y seguí las tablas.')}
            {(championship.status === 'in-progress' || championship.status === 'finished') &&
              'El torneo está en curso o finalizado.'}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to={`/championships/${championship.id}/draw`}
              className={[
                'rounded-lg px-4 py-3 text-center font-bold',
                canDraw || canClose || canFixture
                  ? 'bg-primary text-white'
                  : 'cursor-not-allowed bg-surface-container-highest text-on-surface-variant',
              ].join(' ')}
            >
              Ir a Sorteo / Fases
            </Link>
            <Link
              to={`/championships/${championship.id}/fixture`}
              className="rounded-lg border-2 border-on-surface px-4 py-3 text-center font-bold"
            >
              Ver Fixture
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="rounded-lg bg-on-surface p-6 text-white">
          <p className="mb-2 font-label text-xs uppercase text-secondary-fixed-dim">Equipos</p>
          <p className="font-display text-3xl font-extrabold text-primary-fixed">
            {teams.length} participantes
          </p>
          <p className="mt-3 text-sm text-secondary-fixed-dim">
            Inicio {formatShortDate(championship.startDate)} · Season {championship.season}
          </p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-white p-6">
          <p className="mb-2 font-label text-xs uppercase text-on-surface-variant">Estructura</p>
          <p className="font-headline text-xl font-semibold">8 grupos de 4</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Grupos: {groups.length} · Partidos grupos: {groupMatches.length} · Knockout:{' '}
            {knockoutMatches.length}
          </p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-white p-6">
          <p className="mb-2 font-label text-xs uppercase text-on-surface-variant">Cronograma</p>
          <p className="font-headline text-xl font-semibold">Fase de grupos</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Pendientes: {pendingGroup} · Jugados:{' '}
            {groupMatches.length - pendingGroup}
          </p>
        </div>
      </div>
    </div>
  )
}
