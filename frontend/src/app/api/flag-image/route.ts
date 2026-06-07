import { NextResponse } from 'next/server'

const ALLOWED_IMAGE_TYPES = new Set(['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'])

function parseDataImage(src: string): Response | null {
  const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+)(?:;charset=[^;,]+)?(;base64)?,(.*)$/)
  if (!match) return null

  const contentType = match[1]
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) return null

  const body = match[2] ? Buffer.from(match[3], 'base64') : Buffer.from(decodeURIComponent(match[3]), 'utf-8')
  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': contentType,
    },
  })
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get('src')
  if (!src) {
    return NextResponse.json({ error: 'Missing src' }, { status: 400 })
  }

  if (src.startsWith('data:image/')) {
    return parseDataImage(src) ?? NextResponse.json({ error: 'Unsupported image data URI' }, { status: 400 })
  }

  let url: URL
  try {
    url = new URL(src)
  } catch {
    return NextResponse.json({ error: 'Invalid src' }, { status: 400 })
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return NextResponse.json({ error: 'Unsupported src protocol' }, { status: 400 })
  }

  const upstream = await fetch(url, { cache: 'force-cache' })
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Unable to load image' }, { status: upstream.status })
  }

  const contentType = upstream.headers.get('content-type')?.split(';')[0]?.toLowerCase() ?? ''
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 })
  }

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': contentType,
    },
  })
}
