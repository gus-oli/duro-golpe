const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...rest } = options ?? {}
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw Object.assign(new Error((error as { message: string }).message), {
      status: response.status,
    })
  }

  return response.json() as Promise<T>
}
