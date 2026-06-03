import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Temporary diagnostic endpoint — remove after confirming DB news_type values are correct.
// Visit /api/debug-news to see counts and any bad news_type values.
export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json({ error: 'Supabase not configured — running on mock data' })
  }

  const db = createClient(url, anon)
  const { data, error } = await db.from('news').select('id, title, news_type, published_at')

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  const all      = data ?? []
  const special  = all.filter((r) => r.news_type === 'special')
  const janaza   = all.filter((r) => r.news_type === 'janaza')
  const nullType = all.filter((r) => r.news_type === null)
  const empty    = all.filter((r) => r.news_type === '')
  const invalid  = all.filter((r) => !['special', 'janaza', null, ''].includes(r.news_type))

  return NextResponse.json({
    total:        all.length,
    counts: {
      special:    special.length,
      janaza:     janaza.length,
      null_type:  nullType.length,
      empty_type: empty.length,
      invalid:    invalid.length,
    },
    invalid_records: invalid.map((r) => ({ id: r.id, title: r.title, news_type: r.news_type })),
    null_records:    nullType.map((r) => ({ id: r.id, title: r.title })),
    empty_records:   empty.map((r) => ({ id: r.id, title: r.title })),
  })
}
