import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET  /api/run-migration  — check whether is_featured column exists
// POST /api/run-migration  — attempt auto-migration via service role key
//                           (only works if SUPABASE_SERVICE_ROLE_KEY is set in Vercel)

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json({ ok: false, column_exists: false, error: 'Supabase not configured' })
  }

  const db = createClient(url, anon)
  const { error } = await db.from('news').select('id, is_featured').limit(1)

  const missing = !!error && error.message.toLowerCase().includes('column')

  return NextResponse.json({
    column_exists: !error,
    message: error
      ? `is_featured column is MISSING — ${error.message}`
      : 'is_featured column EXISTS — the database is ready.',
    error: error?.message ?? null,
  })
}

export async function POST() {
  const url         = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Without a direct Postgres connection or service-role RPC we cannot run DDL.
  // Guide the user to the manual approach instead.
  if (!url || !serviceRole) {
    return NextResponse.json({
      ok: false,
      needs_manual: true,
      message: 'SUPABASE_SERVICE_ROLE_KEY is not set in Vercel — follow the manual steps.',
    }, { status: 200 })
  }

  // Attempt via Supabase REST management API
  try {
    const projectRef = new URL(url).hostname.split('.')[0]
    const mgmtRes = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRole}`,
        },
        body: JSON.stringify({
          query: 'ALTER TABLE news ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;',
        }),
      },
    )

    if (mgmtRes.ok) {
      return NextResponse.json({ ok: true, message: 'Migration ran successfully. is_featured column now exists.' })
    }

    const detail = await mgmtRes.text()
    return NextResponse.json({
      ok: false,
      needs_manual: true,
      message: 'Auto-migration failed — follow the manual steps.',
      detail,
    }, { status: 200 })
  } catch {
    return NextResponse.json({
      ok: false,
      needs_manual: true,
      message: 'Auto-migration failed — follow the manual steps.',
    }, { status: 200 })
  }
}
