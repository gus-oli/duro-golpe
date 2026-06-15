'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AUTHENTICATED_NAV_ITEMS } from './app-shell-nav'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const PUBLIC_ONLY = new Set(['/login', '/register'])

export function AppShell({ isAuthenticated, children }: { isAuthenticated: boolean; children: ReactNode }) {
  const pathname = usePathname()
  const showAuthenticatedShell = isAuthenticated && !PUBLIC_ONLY.has(pathname)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-[var(--accent-strong)] focus:shadow-lg"
      >
        Ir para o conteudo principal
      </a>

      {showAuthenticatedShell && (
        <>
          <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--surface-strong)]/95 backdrop-blur">
            <div className="dg-container flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Abrir menu"
                  aria-expanded={isMenuOpen}
                  aria-controls="dg-shell-drawer"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm transition hover:border-[rgba(22,129,255,0.24)]"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <span className="flex flex-col gap-1.5">
                    <span className="block h-0.5 w-5 rounded-full bg-current" />
                    <span className="block h-0.5 w-5 rounded-full bg-current" />
                    <span className="block h-0.5 w-5 rounded-full bg-current" />
                  </span>
                </button>

                <Link href="/" className="shrink-0">
                  <span className="inline-flex items-center gap-3 rounded-2xl border border-[var(--line-strong)] bg-[linear-gradient(135deg,rgba(10,31,24,0.96),rgba(11,92,55,0.96))] px-3 py-2 text-white shadow-[0_12px_30px_rgba(8,20,17,0.18)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--gold),#f1b921)] text-[0.7rem] font-black uppercase tracking-[0.18em] text-[var(--night)]">
                      DG
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.58rem] font-bold uppercase tracking-[0.22em] text-white/70">
                        bolão da copa
                      </span>
                      <span className="block font-[var(--font-display)] text-base font-black uppercase tracking-[0.16em] text-white sm:text-lg">
                        Duro Golpe
                      </span>
                    </span>
                  </span>
                </Link>
              </div>

              <form action="/api/auth/logout" method="post">
                <button type="submit" className="dg-shell-link">
                  Sair
                </button>
              </form>
            </div>
          </header>

          {isMenuOpen && (
            <div className="fixed inset-0 z-50" aria-hidden={!isMenuOpen}>
              <button
                type="button"
                className="absolute inset-0 bg-[rgba(19,32,51,0.48)]"
                aria-label="Fechar menu"
                onClick={() => setIsMenuOpen(false)}
              />
              <aside
                id="dg-shell-drawer"
                aria-label="Navegacao principal"
                className="animate-slide-in absolute left-0 top-0 h-full w-[min(88vw,360px)] border-r border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_60px_rgba(10,19,36,0.22)]"
              >
                <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Navegacao</p>
                    <p className="mt-1 text-xl font-black text-[var(--ink)]">Duro Golpe</p>
                  </div>
                  <button type="button" className="dg-button-secondary px-4 py-2 text-xs" onClick={() => setIsMenuOpen(false)}>
                    Fechar
                  </button>
                </div>

                <nav className="flex flex-col gap-2 px-4 py-4">
                  {AUTHENTICATED_NAV_ITEMS.map((item) => {
                    const isActive =
                      item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cx(
                          'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-black transition',
                          isActive
                            ? 'border-[rgba(22,129,255,0.22)] bg-[rgba(22,129,255,0.10)] text-[var(--accent-strong)]'
                            : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[rgba(22,129,255,0.18)]',
                        )}
                      >
                        <span>{item.label}</span>
                        {isActive && <span className="text-xs uppercase tracking-[0.14em]">Atual</span>}
                      </Link>
                    )
                  })}
                </nav>
              </aside>
            </div>
          )}
        </>
      )}

      <div id="main-content">{children}</div>
    </div>
  )
}
