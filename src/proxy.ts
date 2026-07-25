import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const adminUUID = process.env.ADMIN_UUID

  // Fail secure: block all admin routes if Supabase is not configured
  if (!supabaseUrl || !supabaseKey) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Fail secure: block all admin routes if admin UUID is not configured
  if (!adminUUID) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // getUser() validates the JWT with Supabase's auth server — cannot be spoofed
  const { data: { user } } = await supabase.auth.getUser()

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Only the designated admin UUID can access /admin routes
    if (!user || user.id !== adminUUID) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect already-authenticated users away from the login page
  if (pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
