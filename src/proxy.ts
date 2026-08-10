import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Routes reachable while logged out — the login page itself, plus the
// password-recovery flow (which by definition runs before/without a
// session: requesting the reset email, then landing back from that email
// with a temporary recovery session the client JS still needs to process).
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.includes(pathname)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const adminUUID = process.env.ADMIN_UUID

  // Fail secure: block all admin routes if Supabase is not configured
  if (!supabaseUrl || !supabaseKey) {
    if (pathname.startsWith('/admin') && !isPublicAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Fail secure: block all admin routes if admin UUID is not configured
  if (!adminUUID) {
    if (pathname.startsWith('/admin') && !isPublicAdminPath) {
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

  if (pathname.startsWith('/admin') && !isPublicAdminPath) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // The owner always gets in. Anyone else needs a row in admin_permissions
    // (a Team Access grant) — RLS itself still governs exactly what they
    // can see/do once inside; this is just the front-door check.
    if (user.id !== adminUUID) {
      const { data: perm } = await supabase
        .from('admin_permissions')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!perm) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
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
