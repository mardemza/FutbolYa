type BannerProps = {
  error?: string
  info?: string
}

export function Banner({ error, info }: BannerProps) {
  if (!error && !info) return null
  return (
    <div
      className={[
        'mb-6 rounded-lg border px-4 py-3 text-sm font-semibold',
        error
          ? 'border-error/30 bg-error-container text-error'
          : 'border-primary-container/40 bg-primary-fixed/20 text-primary',
      ].join(' ')}
    >
      {error || info}
    </div>
  )
}
