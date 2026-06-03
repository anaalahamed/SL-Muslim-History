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

// Returns null when SELECT fails (e.g. RLS blocks reads) so callers can return a proper error.
async function getCounts(
  supabase: ReturnType<typeof db>,
  type: string,
  id: string,
): Promise<{ emoji: string; count: number }[] | null> {
  const { data, error } = await supabase
    .from('reactions')
    .select('emoji')
    .eq('content_type', type)
    .eq('content_id', id)

  if (error) {
    console.error('[reactions] getCounts SELECT error:', error.message, { type, id })
    return null
  }

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

  if (counts === null) {
    console.error('[reactions] GET failed to read counts', { type, id })
    return NextResponse.json(
      { error: 'Could not read reactions — check Supabase RLS SELECT policy on the reactions table.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(counts, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

// POST /api/reactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content_type, content_id, emoji, visitor_id } = body

    // ── Input validation ───────────────────────────────────────────────────
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

    console.log('[reactions] POST', { content_type, content_id, emoji, visitor_id_len: visitor_id.length })

    const supabase = db()

    // ── Check for existing reaction ────────────────────────────────────────
    const { data: existing, error: selectErr } = await supabase
      .from('reactions')
      .select('id, emoji')
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .eq('visitor_id', visitor_id)
      .maybeSingle()

    if (selectErr) {
      console.error('[reactions] SELECT existing error:', selectErr.message,
        '— likely RLS SELECT policy missing on reactions table')
      return NextResponse.json(
        { error: 'Could not check existing reaction — RLS SELECT policy needed.', detail: selectErr.message },
        { status: 500 },
      )
    }

    // ── Mutate ─────────────────────────────────────────────────────────────
    if (existing) {
      if (existing.emoji === emoji) {
        // Toggle off — delete
        const { error: delErr } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existing.id)

        if (delErr) {
          console.error('[reactions] DELETE error:', delErr.message)
          return NextResponse.json(
            { error: 'Could not remove reaction — RLS DELETE policy needed.', detail: delErr.message },
            { status: 500 },
          )
        }
        console.log('[reactions] deleted reaction', { id: existing.id })
      } else {
        // Change emoji
        const { error: updErr } = await supabase
          .from('reactions')
          .update({ emoji })
          .eq('id', existing.id)

        if (updErr) {
          console.error('[reactions] UPDATE error:', updErr.message)
          return NextResponse.json(
            { error: 'Could not update reaction — RLS UPDATE policy needed.', detail: updErr.message },
            { status: 500 },
          )
        }
        console.log('[reactions] updated reaction', { id: existing.id, from: existing.emoji, to: emoji })
      }
    } else {
      // New reaction
      const { error: insErr } = await supabase
        .from('reactions')
        .insert({ content_type, content_id, emoji, visitor_id })

      if (insErr) {
        console.error('[reactions] INSERT error:', insErr.message,
          '— likely RLS INSERT policy missing on reactions table')
        return NextResponse.json(
          { error: 'Could not save reaction — RLS INSERT policy needed.', detail: insErr.message },
          { status: 500 },
        )
      }
      console.log('[reactions] inserted reaction', { content_type, content_id, emoji })
    }

    // ── Return updated counts ──────────────────────────────────────────────
    const reactions = await getCounts(supabase, content_type, content_id)

    if (reactions === null) {
      // Write succeeded but we can't read back. Return optimistic success
      // so the client keeps its optimistic count rather than resetting to 0.
      console.error('[reactions] write OK but getCounts failed — RLS SELECT policy needed')
      return NextResponse.json({ success: true, reactions: 'recount_failed' })
    }

    console.log('[reactions] returning counts', reactions)
    return NextResponse.json({ success: true, reactions })

  } catch (err) {
    console.error('[reactions] unhandled error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
