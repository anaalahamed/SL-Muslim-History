import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const REPO = 'anaalahamed/SL-Muslim-History'
const BRANCH = 'main'

// Lets the admin download the site's source code from inside the admin
// panel itself, instead of needing a separate trip to GitHub. The repo is
// public, so this is really just a convenience wrapper around GitHub's own
// zip-of-a-branch endpoint (the same one the "Download ZIP" button uses) —
// gated behind admin login purely to keep it tucked inside the admin UI.
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const adminUUID = process.env.ADMIN_UUID

  if (!supabaseUrl || !supabaseKey || !adminUUID) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll() { /* read-only check — no session refresh needed for a download */ },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== adminUUID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const upstream = await fetch(`https://codeload.github.com/${REPO}/zip/refs/heads/${BRANCH}`)
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Could not fetch the source code from GitHub. Please try again.' }, { status: 502 })
  }

  const dateStamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="sl-muslim-history-code-${dateStamp}.zip"`,
      'Cache-Control': 'no-store',
    },
  })
}
