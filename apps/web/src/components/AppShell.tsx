import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from './Icon'

type NavItem = {
  to: string
  label: string
  icon: string
  end?: boolean
}

type AppShellProps = {
  title: string
  subtitle?: string
  tabs?: Array<{ to: string; label: string; end?: boolean }>
}

export function AppShell({ title, subtitle, tabs }: AppShellProps) {
  const navigate = useNavigate()
  const { championshipId } = useParams()
  const { user, logout } = useAuth()

  const displayName = user?.displayName?.trim() || user?.email || 'Organizador'
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const navItems: NavItem[] = championshipId
    ? [
        { to: `/championships/${championshipId}`, label: 'Dashboard', icon: 'dashboard', end: true },
        { to: `/championships/${championshipId}/teams`, label: 'Equipos', icon: 'groups' },
        { to: `/championships/${championshipId}/fixture`, label: 'Resultados', icon: 'scoreboard' },
        { to: `/championships/${championshipId}/standings`, label: 'Tablas', icon: 'table_chart' },
        { to: `/championships/${championshipId}/bracket`, label: 'Playoffs', icon: 'account_tree' },
      ]
    : [
        { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
        { to: '/', label: 'Torneos', icon: 'trophy' },
      ]

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[280px] flex-col bg-on-surface p-4 md:flex">
        <div className="mb-8 px-2">
          <button
            type="button"
            className="font-display text-3xl font-extrabold uppercase tracking-tighter text-primary-fixed"
            onClick={() => navigate('/')}
          >
            FutbolYa
          </button>
          <p className="mt-1 font-label text-xs uppercase tracking-widest text-secondary-fixed-dim">
            Admin Regional
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-4 py-3 transition-all',
                  isActive
                    ? 'translate-x-1 bg-on-secondary-fixed-variant font-bold text-primary-fixed'
                    : 'text-secondary-fixed-dim hover:bg-on-secondary-fixed-variant/50 hover:text-primary-fixed',
                ].join(' ')
              }
            >
              <Icon name={item.icon} />
              <span className="font-label text-xs tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary-fixed py-3 font-bold text-on-primary-fixed transition-colors hover:bg-primary-container"
        >
          <Icon name="add" />
          Nuevo Torneo
        </button>

        <div className="space-y-1 border-t border-on-secondary-fixed-variant pt-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-2 text-secondary-fixed-dim hover:text-primary-fixed"
          >
            <Icon name="help" />
            <span className="font-label text-xs">Soporte</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-error hover:bg-error/10"
          >
            <Icon name="logout" />
            <span className="font-label text-xs">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen pitch-grid md:ml-[280px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-on-surface px-4 md:px-margin-desktop">
          <div className="min-w-0">
            <p className="truncate font-headline text-xl font-bold uppercase tracking-tight text-primary-fixed md:text-2xl">
              {title}
            </p>
            {subtitle && (
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {tabs && tabs.length > 0 && (
              <div className="hidden items-center gap-6 lg:flex">
                {tabs.map((tab) => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) =>
                      [
                        'pb-1 font-body transition-colors',
                        isActive
                          ? 'border-b-2 border-primary-fixed font-bold text-primary-fixed'
                          : 'text-on-secondary-container hover:text-primary-fixed',
                      ].join(' ')
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </div>
            )}
            <Icon name="notifications" className="text-primary-fixed" />
            <div className="hidden text-right sm:block">
              <p className="font-label text-xs leading-none text-white">{displayName}</p>
              <p className="text-[10px] uppercase text-secondary-fixed-dim">Director de Torneo</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-fixed bg-surface-container text-xs font-bold text-on-surface">
              {initials || 'FY'}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-margin-desktop md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
