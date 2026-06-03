import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Diagnostic endpoint — visit /api/debug-news to audit the full is_featured state.
// Remove this file once the column is confirmed working.
export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json({
      error: 'Supabase env vars not set — app is running on mock data',
      mock_data_note: 'All mock items have is_featured: false (no featured section will show)',
    })
  }

  const db = createClient(url, anon)

  // ── 1. Check if is_featured column exists ──────────────────────────────────
  // PostgREST will error if we try to select a column that does not exist.
  const { data: colCheck, error: colError } = await db
    .from('news')
    .select('id, is_featured')
    .limit(1)

  if (colError) {
    return NextResponse.json({
      column_exists: false,
      error: colError.message,
      diagnosis: 'The is_featured column does NOT exist in the news table.',
      fix: 'Run this SQL in your Supabase SQL editor: ALTER TABLE news ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
    })
  }

  // ── 2. Column exists — fetch all rows ──────────────────────────────────────
  const { data, error } = await db
    .from('news')
    .select('id, title, news_type, is_featured, published_at')
    .order('published_at', { ascending: false })

  if (error || !data) {
    return NextResponse.json({ column_exists: true, error: error?.message ?? 'no data' })
  }

  const all          = data
  const featured     = all.filter((r) => r.is_featured === true)
  const notFeatured  = all.filter((r) => r.is_featured !== true)
  const nullFeatured = all.filter((r) => r.is_featured === null)

  return NextResponse.json({
    column_exists: true,
    total_rows: all.length,
    counts: {
      is_featured_true:  featured.length,
      is_featured_false: notFeatured.filter((r) => r.is_featured === false).length,
      is_featured_null:  nullFeatured.length,
    },
    featured_items: featured.map((r) => ({
      id:           r.id,
      title:        r.title,
      news_type:    r.news_type,
      is_featured:  r.is_featured,
      published_at: r.published_at,
    })),
    all_items: all.map((r) => ({
      id:          r.id,
      title:       r.title.slice(0, 60),
      news_type:   r.news_type,
      is_featured: r.is_featured,
    })),
    diagnosis: featured.length === 0
      ? 'No items have is_featured = true. Go to Admin → News → edit a post → check "Mark as Featured Story" → save.'
      : `${featured.length} featured item(s) found. Featured section should appear on the correct page.`,
  })
}
