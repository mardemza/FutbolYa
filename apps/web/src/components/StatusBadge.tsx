import { statusLabel, statusTone } from '../lib/championshipUi'

const toneClass: Record<ReturnType<typeof statusTone>, string> = {
  green: 'bg-primary-container/20 text-primary',
  blue: 'bg-secondary-container text-on-secondary-container',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-error-container text-error',
  gray: 'bg-surface-container-highest text-on-surface-variant',
}

type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded px-2 py-1 font-label text-[11px] font-medium tracking-wider uppercase ${toneClass[statusTone(status)]}`}
    >
      {statusLabel(status)}
    </span>
  )
}
