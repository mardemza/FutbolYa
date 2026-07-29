import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background pitch-grid px-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
        <div className="bg-on-surface px-8 py-6">
          <p className="font-display text-3xl font-extrabold uppercase tracking-tighter text-primary-fixed">
            FutbolYa
          </p>
          <p className="mt-1 font-label text-xs uppercase tracking-widest text-secondary-fixed-dim">
            Acceso organizador
          </p>
        </div>
        <form className="space-y-4 p-8" onSubmit={onSubmit}>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Iniciar sesión</h1>
          <Banner error={error} />
          <div>
            <label className="mb-1 block font-label text-xs uppercase text-on-surface-variant">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
              placeholder="vos@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block font-label text-xs uppercase text-on-surface-variant">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white disabled:opacity-50"
          >
            <Icon name="login" />
            Entrar
          </button>
          <p className="text-center text-sm text-on-surface-variant">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
