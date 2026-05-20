import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { BadgeToastProvider } from '@/components/Badges/BadgeToastProvider'
import { AppShell } from '@/components/ui/AppShell'
import { isRealtimeEnabled } from '@/lib/realtime'
import './globals.css'

export const metadata: Metadata = {
  title: 'Duro Golpe - Copa 2026',
  description: 'Plataforma de palpites para a Copa do Mundo 2026',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f6f8fb',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? null
  const realtimeEnabled = Boolean(token) && isRealtimeEnabled()

  return (
    <html lang="pt-BR">
      <body>
        <BadgeToastProvider realtimeEnabled={realtimeEnabled}>
          <AppShell isAuthenticated={Boolean(token)}>{children}</AppShell>
        </BadgeToastProvider>
      </body>
    </html>
  )
}
