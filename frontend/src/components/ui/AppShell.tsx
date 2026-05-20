'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const PUBLIC_ONLY = new Set(['/login', '/register'])

const NAV_ITEMS = [
  { href: '/', label: 'Início' },
  { href: '/matches', label: 'Partidas' },
  { href: '/leagues', label: 'Ligas' },
  { href: '/outrights', label: 'Especiais' },
]

export function AppShell({ isAuthenticated, children }: { isAuthenticated: boolean; children: ReactNode }) {
  const pathname = usePathname()
  const showAuthenticatedShell = isAuthenticated && !PUBLIC_ONLY.has(pathname)

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-[var(--accent-strong)] focus:shadow-lg"
      >
        Ir para o conteúdo principal
      </a>

      {showAuthenticatedShell && (
        <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--surface-strong)]/95 backdrop-blur">
          <div className="dg-container flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="shrink-0">
                <span className="inline-flex items-center gap-3 rounded-2xl border border-[var(--line-strong)] bg-[linear-gradient(135deg,rgba(10,31,24,0.96),rgba(11,92,55,0.96))] px-3 py-2 text-white shadow-[0_12px_30px_rgba(8,20,17,0.18)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--gold),#f1b921)] text-[0.7rem] font-black uppercase tracking-[0.18em] text-[var(--night)]">
                    DG
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.58rem] font-bold uppercase tracking-[0.22em] text-white/70">
                      bolao da copa
                    </span>
                    <span className="block font-[var(--font-display)] text-base font-black uppercase tracking-[0.16em] text-white sm:text-lg">
                      Duro Golpe
                    </span>
                  </span>
                </span>
              </Link>
              <p className="hidden text-sm font-medium text-[var(--muted)] lg:block">
                Companion da Copa para palpites, ligas e especiais.
              </p>
            </div>

            <nav aria-label="Principal" className="hidden items-center gap-2 md:flex">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx('dg-shell-link', isActive && 'dg-shell-link-active')}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/profile" className={cx('dg-shell-link', pathname.startsWith('/profile') && 'dg-shell-link-active')}>
                Conta
              </Link>
              <a href="/api/auth/logout" className="dg-shell-link">
                Sair
              </a>
            </div>
          </div>

          <div className="border-t border-[var(--line)] bg-[var(--surface)] md:hidden">
            <div className="dg-container flex items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx('dg-shell-link whitespace-nowrap', isActive && 'dg-shell-link-active')}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </header>
      )}

      <div id="main-content">{children}</div>
    </div>
  )
}
