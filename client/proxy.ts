import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === '/login' && req.cookies.get('logged_in')?.value === '1') {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/login'] }
