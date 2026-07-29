type SegmentedProgressProps = {
  value: number
  max?: number
  className?: string
}

export function SegmentedProgress({ value, max = 32, className = '' }: SegmentedProgressProps) {
  const filled = Math.max(0, Math.min(max, value))
  return (
    <div className={`flex gap-[2px] ${className}`.trim()}>
      {Array.from({ length: max }, (_, index) => (
        <div
          key={index}
          className={[
            'h-3 flex-1 rounded-[1px]',
            index < filled ? 'bg-primary-container' : 'bg-surface-container-highest',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
