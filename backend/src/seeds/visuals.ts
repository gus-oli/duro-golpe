export function createSeedFlagDataUri(code: string, primary: string, secondary: string, accent: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64" role="img" aria-label="${code}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="96" height="64" rx="10" fill="url(#g)" />
      <circle cx="20" cy="18" r="9" fill="${accent}" fill-opacity="0.9" />
      <path d="M14 44c12-10 23-15 54-18 6-1 10 3 10 8 0 8-9 18-24 22H18c-6 0-10-5-10-10 0-1 2-2 6-2z" fill="#ffffff" fill-opacity="0.16" />
      <text x="48" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff">${code}</text>
    </svg>
  `.replace(/\s+/g, ' ')

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
