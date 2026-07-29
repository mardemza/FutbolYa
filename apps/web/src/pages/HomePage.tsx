import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { SegmentedProgress } from '../components/SegmentedProgress'
import { StatusBadge } from '../components/StatusBadge'
import { rememberChampionship } from '../lib/championshipUi'
import type { Championship } from '../types'

export function HomePage() {
  const navigate = useNavigate()
  const [championships, setChampionships] = useState<Championship[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: 'Copa FutbolYa',
    season: '2026',
    startDate: '2026-08-01',
  })

  const loadMine = async () => {
    const list = await apiRequest<Championship[]>('/championships')
    setChampionships(list)
    list.forEach((item) => rememberChampionship(item))
  }

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        await loadMine()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar torneos')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return championships
    return championships.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.season.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    )
  }, [championships, search])

  const createChampionship = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const created = await apiRequest<Championship>('/championships', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      rememberChampionship(created)
      setInfo('Campeonato creado')
      navigate(`/championships/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Banner error={error} info={info} />

      <div className="mb-gutter grid grid-cols-12 gap-gutter">
        <div className="relative col-span-12 flex flex-col justify-between overflow-hidden bg-on-surface p-8 lg:col-span-7 lg:p-10">
          <div className="relative z-10">
            <span className="mb-6 inline-block bg-primary-fixed px-3 py-1 font-label text-xs uppercase text-on-primary-fixed">
              Nuevo
            </span>
            <h2 className="mb-4 font-display text-4xl font-extrabold leading-tight text-white md:text-5xl">
              ORGANIZÁ TU PRÓXIMO
              <br />
              <span className="text-primary-fixed">CAMPEONATO</span>
            </h2>
            <p className="mb-8 max-w-md font-body text-lg text-secondary-fixed-dim">
              Estructura profesional de 32 equipos. Gestión automática de fixture, tablas de
              posiciones y llaves de eliminación directa.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setShowCreate((prev) => !prev)}
              className="flex items-center gap-3 rounded-lg bg-primary-container px-8 py-4 font-bold text-on-primary-fixed transition-all hover:bg-primary-fixed active:scale-95"
            >
              <Icon name="add_circle" filled />
              CREAR CAMPEONATO
            </button>
            <p className="font-label text-xs text-white/60">Cupo fijado en 32 equipos</p>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-10">
            <Icon name="sports_soccer" className="text-[200px] text-primary-fixed" />
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-5">
          <div className="col-span-2 flex flex-col justify-between border border-outline-variant bg-white p-6">
            <div>
              <p className="mb-2 font-label text-xs uppercase text-on-secondary-container">
                Mis torneos
              </p>
              <h3 className="font-display text-3xl font-extrabold text-on-surface">
                {championships.length}
              </h3>
            </div>
            <SegmentedProgress
              value={Math.min(32, championships.length * 4)}
              className="mt-4"
            />
            <p className="mt-2 font-label text-xs text-on-surface-variant">
              Vinculados a tu cuenta
            </p>
          </div>
          <div className="border border-outline-variant bg-primary p-6 text-white">
            <Icon name="stadium" className="mb-4" />
            <p className="font-label text-xs uppercase opacity-70">Formato</p>
            <p className="font-headline text-2xl font-semibold">32 equipos</p>
          </div>
          <div className="border border-outline-variant bg-white p-6">
            <Icon name="groups" className="mb-4 text-primary" filled />
            <p className="font-label text-xs uppercase text-on-surface-variant">Grupos</p>
            <p className="font-headline text-2xl font-semibold text-on-surface">8 × 4</p>
          </div>
        </div>
      </div>

      {showCreate && (
        <form
          onSubmit={createChampionship}
          className="mb-6 grid gap-4 border border-outline-variant bg-white p-6 md:grid-cols-4"
        >
          <input
            className="border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre"
            required
          />
          <input
            className="border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
            value={form.season}
            onChange={(e) => setForm((prev) => ({ ...prev, season: e.target.value }))}
            placeholder="Temporada"
            required
          />
          <input
            type="date"
            className="border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
            value={form.startDate}
            onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
            required
          />
          <button
            disabled={loading}
            type="submit"
            className="rounded-lg bg-primary px-4 py-3 font-bold text-white hover:bg-primary-container"
          >
            Confirmar alta
          </button>
        </form>
      )}

      <section className="overflow-hidden border border-outline-variant bg-white">
        <div className="flex flex-col gap-4 bg-on-surface px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <h3 className="flex items-center gap-3 font-headline text-xl font-semibold text-white md:text-2xl">
            <Icon name="folder_open" className="text-primary-fixed" />
            MIS CAMPEONATOS
          </h3>
          <input
            className="rounded-lg border-none bg-on-secondary-fixed-variant px-4 py-2 text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary-fixed"
            placeholder="Buscar torneo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container font-label text-xs uppercase tracking-wider text-on-surface">
                <th className="px-6 py-4 md:px-8">Nombre del Torneo</th>
                <th className="px-6 py-4 text-center md:px-8">Inscriptos</th>
                <th className="px-6 py-4 md:px-8">Estado</th>
                <th className="px-6 py-4 text-right md:px-8">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-on-surface-variant">
                    {loading
                      ? 'Cargando…'
                      : 'Todavía no tenés torneos. Creá el primero con el botón de arriba.'}
                  </td>
                </tr>
              )}
              {filtered.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-5 md:px-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center bg-on-surface text-xl font-black text-primary-fixed">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{item.name}</p>
                        <p className="text-sm text-on-surface-variant">Temporada {item.season}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 md:px-8">
                    <div className="mx-auto max-w-[140px]">
                      <p className="mb-2 text-center font-label text-xs">
                        {item.registeredTeams}/{item.maxTeams}
                      </p>
                      <SegmentedProgress value={item.registeredTeams} max={item.maxTeams} />
                    </div>
                  </td>
                  <td className="px-6 py-5 md:px-8">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-5 text-right md:px-8">
                    <Link
                      to={`/championships/${item.id}`}
                      className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                    >
                      Abrir <Icon name="arrow_forward" className="text-base" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
