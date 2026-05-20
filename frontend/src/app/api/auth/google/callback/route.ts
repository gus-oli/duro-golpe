import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const hasAuthCookie = req.cookies.has('auth_token')
  return NextResponse.redirect(new URL(hasAuthCookie ? '/matches' : '/login?error=oauth_failed', req.url))
}
