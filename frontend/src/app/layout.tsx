import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { BadgeToastProvider } from '@/components/Badges/BadgeToastProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Duro Golpe — Copa 2026',
  description: 'Plataforma de palpites para a Copa do Mundo 2026',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? null

  return (
    <html lang="pt-BR">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-green-700 focus:rounded focus:shadow"
        >
          Ir para conteúdo principal
        </a>
        <BadgeToastProvider token={token}>
          <div id="main-content">{children}</div>
        </BadgeToastProvider>
      </body>
    </html>
  )
}
