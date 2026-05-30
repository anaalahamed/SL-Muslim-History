import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Guard /admin routes — redirect to login if no session cookie
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('slmh_admin_session')
    if (!session?.value) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
