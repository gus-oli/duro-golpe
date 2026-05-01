import type { ReactNode } from 'react'

type Tone = 'open' | 'live' | 'locked' | 'resolved' | 'neutral' | 'success' | 'warning'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function PageShell({
  children,
  narrow = false,
  className,
}: {
  children: ReactNode
  narrow?: boolean
  className?: string
}) {
  return (
    <main className={cx('dg-page', className)}>
      <div className={cx(narrow ? 'dg-container-narrow' : 'dg-container', 'dg-reveal')}>{children}</div>
    </main>
  )
}

export function HeroSection({
  eyebrow,
  title,
  children,
  actions,
  aside,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
}) {
  return (
    <section className="dg-surface-dark dg-reveal relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--pitch),var(--gold),var(--sky),var(--coral))]" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:items-end">
        <div className="relative z-10">
          {eyebrow && <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">{eyebrow}</p>}
          <h1 className="max-w-3xl text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {children && <div className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">{children}</div>}
          {actions && <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
        </div>
        {aside && <div className="relative z-10">{aside}</div>}
      </div>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  inverse = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  inverse?: boolean
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className={`text-xs font-bold uppercase tracking-[0.14em] ${inverse ? 'text-[var(--gold)]' : 'text-[var(--pitch-dark)]'}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`mt-1 text-2xl font-black sm:text-3xl ${inverse ? 'text-white' : 'text-[var(--ink)]'}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${inverse ? 'text-white/76' : 'text-[var(--muted)]'}`}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="dg-surface px-5 py-10 text-center">
      <p className="text-lg font-black text-[var(--ink)]">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const className =
    tone === 'live'
      ? 'dg-chip-live'
      : tone === 'locked' || tone === 'warning'
        ? 'dg-chip-locked'
        : tone === 'resolved'
          ? 'dg-chip-resolved'
          : tone === 'open' || tone === 'success'
            ? 'dg-chip-open'
            : 'dg-chip'

  return <span className={className}>{children}</span>
}
