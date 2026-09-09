import { useEffect, useState } from 'react'
import { Icon } from '../Icon'

function isStandaloneDisplay(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return Boolean(nav.standalone)
}

type PwaInstallButtonProps = {
  className?: string
  variant?: 'header' | 'sidebar'
}

export function PwaInstallButton({ className = '', variant = 'header' }: PwaInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() =>
    typeof window !== 'undefined' ? isStandaloneDisplay() : false,
  )

  useEffect(() => {
    const onBeforeInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !deferredPrompt) return null

  const base =
    variant === 'sidebar'
      ? 'flex w-full items-center gap-3 px-4 py-2 text-secondary-fixed-dim hover:text-primary-fixed'
      : 'hidden items-center gap-1 rounded-lg border border-primary-fixed/40 px-3 py-1.5 font-label text-[10px] uppercase tracking-wider text-primary-fixed transition-colors hover:bg-primary-fixed/10 sm:inline-flex'

  return (
    <button
      type="button"
      className={[base, className].filter(Boolean).join(' ')}
      onClick={async () => {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          setInstalled(true)
        }
        setDeferredPrompt(null)
      }}
    >
      {variant === 'sidebar' ? (
        <>
          <Icon name="download" />
          <span className="font-label text-xs">Instalar app</span>
        </>
      ) : (
        'Instalar app'
      )}
    </button>
  )
}
