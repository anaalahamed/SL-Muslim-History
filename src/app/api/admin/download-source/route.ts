import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const REPO = 'anaalahamed/SL-Muslim-History'
const BRANCH = 'main'

// Lets the admin download the site's source code from inside the admin
// panel itself, instead of needing a separate trip to GitHub — gated
// behind admin login purely to keep it tucked inside the admin UI.
//
// The repo is private, so this uses GitHub's authenticated zipball API
// with a classic, no-expiration token in GITHUB_TOKEN (the plain
// codeload.github.com URL only works for public repos without a token).
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const adminUUID = process.env.ADMIN_UUID
  const githubToken = process.env.GITHUB_TOKEN

  if (!supabaseUrl || !supabaseKey || !adminUUID || !githubToken) {
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

  const upstream = await fetch(`https://api.github.com/repos/${REPO}/zipball/${BRANCH}`, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Could not fetch the source code from GitHub. Please try again.' }, { status: 502 })
  }

  // The repo is small (well under 1MB zipped), so fetching it fully here
  // before responding — rather than trying to stream the response straight
  // through, which previously hung with no error — is fast and reliable,
  // and lets the browser report real download progress via Content-Length.
  const buffer = await upstream.arrayBuffer()
  const dateStamp = new Date().toISOString().slice(0, 10)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="sl-muslim-history-code-${dateStamp}.zip"`,
      'Content-Length': String(buffer.byteLength),
      'Cache-Control': 'no-store',
    },
  })
}
