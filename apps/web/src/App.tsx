import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RequireAuth } from './components/RequireAuth'
import { AuthProvider } from './context/AuthContext'
import { ChampionshipProvider, useChampionship } from './context/ChampionshipContext'
import { formatShortDate } from './lib/championshipUi'
import { BracketPage } from './pages/BracketPage'
import { DashboardPage } from './pages/DashboardPage'
import { DrawPage } from './pages/DrawPage'
import { FixturePage } from './pages/FixturePage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { StandingsPage } from './pages/StandingsPage'
import { TeamsPage } from './pages/TeamsPage'

function HomeLayout() {
  return (
    <RequireAuth>
      <AppShell title="Panel de Control" />
    </RequireAuth>
  )
}

function ChampionshipLayout() {
  return (
    <RequireAuth>
      <ChampionshipProvider>
        <ChampionshipLayoutInner />
      </ChampionshipProvider>
    </RequireAuth>
  )
}

function ChampionshipLayoutInner() {
  const { championship } = useChampionship()
  const id = championship?.id
  const title = championship?.name ?? 'Campeonato'
  const subtitle = championship
    ? `TEMPORADA ${championship.season} • INICIA ${formatShortDate(championship.startDate)}`
    : undefined

  const tabs = id
    ? [
        { to: `/championships/${id}`, label: 'Resumen', end: true },
        { to: `/championships/${id}/teams`, label: 'Inscripciones' },
        { to: `/championships/${id}/draw`, label: 'Sorteo' },
        { to: `/championships/${id}/fixture`, label: 'Fixture' },
        { to: `/championships/${id}/standings`, label: 'Tablas' },
        { to: `/championships/${id}/bracket`, label: 'Playoffs' },
      ]
    : undefined

  return <AppShell title={title} subtitle={subtitle} tabs={tabs} />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<HomeLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          <Route path="/championships/:championshipId" element={<ChampionshipLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="draw" element={<DrawPage />} />
            <Route path="fixture" element={<FixturePage />} />
            <Route path="standings" element={<StandingsPage />} />
            <Route path="bracket" element={<BracketPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
