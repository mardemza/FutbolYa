import { Icon } from './Icon'

const phases = ['DRAFT', 'INSCRIPCIONES', 'SORTEO', 'GRUPOS', 'PLAYOFFS'] as const

type PhaseStepperProps = {
  activeIndex: number
  currentLabel?: string
}

export function PhaseStepper({ activeIndex, currentLabel }: PhaseStepperProps) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="font-headline text-2xl font-semibold uppercase tracking-tight text-on-surface">
          Estado del Torneo
        </h2>
        <div className="rounded bg-tertiary-fixed px-3 py-1 font-label text-xs font-medium uppercase tracking-wider text-on-tertiary-fixed">
          Fase actual: {currentLabel ?? phases[activeIndex]}
        </div>
      </div>
      <div className="flex w-full items-center justify-between overflow-x-auto pb-2">
        {phases.map((phase, index) => {
          const done = index < activeIndex
          const current = index === activeIndex
          return (
            <div key={phase} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-[100px] flex-col items-center gap-2">
                <div
                  className={[
                    'z-10 flex h-10 w-10 items-center justify-center rounded-full font-bold',
                    current
                      ? 'border-4 border-primary-fixed bg-primary text-white'
                      : done
                        ? 'bg-primary text-white'
                        : 'border-2 border-outline-variant bg-surface-container text-on-surface-variant',
                  ].join(' ')}
                >
                  {done ? <Icon name="check" className="text-lg" /> : index + 1}
                </div>
                <span
                  className={[
                    'font-label text-xs tracking-wider',
                    current || done ? 'font-bold text-primary' : 'text-on-surface-variant',
                  ].join(' ')}
                >
                  {phase}
                </span>
              </div>
              {index < phases.length - 1 && (
                <div
                  className={[
                    'mx-2 h-0.5 min-w-[24px] flex-grow',
                    index < activeIndex ? 'bg-primary' : 'bg-outline-variant',
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
