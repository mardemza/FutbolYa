import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return
      // Check for updates periodically while the tab is open.
      const intervalMs = 60 * 60 * 1000
      window.setInterval(() => {
        void registration.update()
      }, intervalMs)
      if (import.meta.env.DEV) {
        console.info('[pwa] registered', swUrl)
      }
    },
  })

  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (needRefresh) setDismissed(false)
  }, [needRefresh])

  if (!needRefresh || dismissed) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto flex max-w-lg flex-col gap-3 rounded-xl border border-outline-variant bg-on-surface p-4 text-primary-fixed shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="font-body text-sm text-secondary-fixed">
        Hay una actualización disponible. Actualizá para usar la última versión.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="rounded-lg px-3 py-2 font-label text-xs uppercase tracking-wide text-secondary-fixed-dim hover:text-primary-fixed"
          onClick={() => {
            setDismissed(true)
            setNeedRefresh(false)
          }}
        >
          Ahora no
        </button>
        <button
          type="button"
          className="rounded-lg bg-primary-fixed px-4 py-2 font-bold text-on-primary-fixed transition-colors hover:bg-primary-container"
          onClick={() => {
            void updateServiceWorker(true)
          }}
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}
