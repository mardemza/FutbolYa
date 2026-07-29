import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Icon } from '../components/Icon'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(email, password, displayName.trim() || undefined)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar')
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
            Alta de organizador
          </p>
        </div>
        <form className="space-y-4 p-8" onSubmit={onSubmit}>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Crear cuenta</h1>
          <Banner error={error} />
          <div>
            <label className="mb-1 block font-label text-xs uppercase text-on-surface-variant">
              Nombre
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border-b-2 border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary"
              placeholder="Juan Pérez"
            />
          </div>
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-bold text-on-primary-fixed disabled:opacity-50"
          >
            <Icon name="person_add" />
            Registrarme
          </button>
          <p className="text-center text-sm text-on-surface-variant">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
