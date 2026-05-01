import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Duro Golpe',
    short_name: 'Duro Golpe',
    description: 'Plataforma de palpites para a Copa do Mundo 2026',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a0a0a',
    lang: 'pt-BR',
  }
}
