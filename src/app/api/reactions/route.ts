import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { REACTIONS } from '@/lib/reactions'

// Cast to string[] so .includes() accepts arbitrary strings from request bodies.
const VALID_EMOJIS: string[] = [...REACTIONS]
const VALID_TYPES  = ['article', 'news']

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getCounts(supabase: ReturnType<typeof db>, type: string, id: string) {
  const { data } = await supabase
    .from('reactions')
    .select('emoji')
    .eq('content_type', type)
    .eq('content_id', id)

  const map: Record<string, number> = {}
  for (const row of (data ?? [])) {
    map[row.emoji] = (map[row.emoji] ?? 0) + 1
  }
  return Object.entries(map).map(([emoji, count]) => ({ emoji, count }))
}

// GET /api/reactions?type=article&id=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id   = searchParams.get('id')

  if (!type || !id || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const supabase = db()
  const counts = await getCounts(supabase, type, id)
  return NextResponse.json(counts, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

// POST /api/reactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content_type, content_id, emoji, visitor_id } = body

    if (!content_type || !content_id || !emoji || !visitor_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (!VALID_TYPES.includes(content_type)) {
      return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
    }
    if (!VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })
    }
    if (typeof visitor_id !== 'string' || visitor_id.length < 10 || visitor_id.length > 128) {
      return NextResponse.json({ error: 'Invalid visitor_id' }, { status: 400 })
    }

    const supabase = db()

    // Check for existing reaction
    const { data: existing } = await supabase
      .from('reactions')
      .select('id, emoji')
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .eq('visitor_id', visitor_id)
      .maybeSingle()

    if (existing) {
      if (existing.emoji === emoji) {
        await supabase.from('reactions').delete().eq('id', existing.id)
      } else {
        await supabase.from('reactions').update({ emoji }).eq('id', existing.id)
      }
    } else {
      await supabase.from('reactions').insert({ content_type, content_id, emoji, visitor_id })
    }

    const reactions = await getCounts(supabase, content_type, content_id)
    return NextResponse.json({ success: true, reactions })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
