import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = [ '/ai']

const isAsset = (p: string) =>
  p.startsWith('/_next') || p.startsWith('/favicon') || /\.[a-zA-Z0-9]+$/.test(p)

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  if (isAsset(pathname)) return NextResponse.next()

  const loggedIn = req.cookies.get('logged_in')?.value === '1'
  const needAuth = PROTECTED.some(p => pathname.startsWith(p))

  if (needAuth && !loggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname + search)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/login') && loggedIn) {
    const home = req.nextUrl.clone()
    home.pathname = '/'
    return NextResponse.redirect(home)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/gold/:path*',
    '/ai/:path*',
  ],
}