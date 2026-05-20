import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Duro Golpe',
    short_name: 'Duro Golpe',
    description: 'Plataforma de palpites para a Copa do Mundo 2026',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f6f8fb',
    lang: 'pt-BR',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
