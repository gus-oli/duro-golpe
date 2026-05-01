import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Duro Golpe</h1>
      <p className="text-lg text-gray-600 mb-8">Plataforma de palpites — Copa do Mundo 2026</p>
      <div className="flex gap-4">
        <Link href="/matches" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium">
          Ver Partidas
        </Link>
        <Link href="/login" className="px-6 py-3 border border-gray-300 rounded-lg font-medium">
          Entrar
        </Link>
      </div>
    </main>
  )
}
