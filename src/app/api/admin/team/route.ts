import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Creates a new admin-panel login for a team member (e.g. a spouse or
// writer), gated to the site owner only. Creating an auth user requires
// the service-role key, which must never reach the browser — hence this
// server route instead of doing it directly from the client.
export async function POST(request: NextRequest) {
  const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminUUID        = process.env.ADMIN_UUID

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !adminUUID) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll() { /* read-only check */ },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== adminUUID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { email, password, name } = body ?? {}
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Valid email and a password of at least 6 characters are required.' }, { status: 400 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // the owner is setting this account up directly, no verification email needed
  })
  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'Could not create the account.' }, { status: 400 })
  }

  const { error: permError } = await admin.from('admin_permissions').insert({
    user_id: created.user.id,
    name: name || '',
    email,
  })
  if (permError) {
    // Roll back the auth user so we don't leave an orphaned account with no permissions row
    await admin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: permError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, userId: created.user.id })
}

// Fully removes a team member's login (not just their permissions row) —
// deleting the auth.users account requires the service-role key too.
export async function DELETE(request: NextRequest) {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminUUID       = process.env.ADMIN_UUID

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !adminUUID) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll() { /* read-only check */ },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== adminUUID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await request.json().catch(() => ({}))
  if (!userId || userId === adminUUID) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  await admin.from('admin_permissions').delete().eq('user_id', userId)
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
