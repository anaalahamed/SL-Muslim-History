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

// Service-role client — used only for POST mutations (INSERT/UPDATE/DELETE).
// Bypasses RLS so ownership cannot be forged via the request body.
function serviceDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Max number of times a visitor may change their reaction on a single post.
// The very first reaction is free (not a change); switching or removing it
// after that counts against this limit.
const MAX_CHANGES = 4

// Returns null when SELECT fails (e.g. RLS blocks reads) so callers can return a proper error.
// Rows with emoji = null (a removed reaction, kept only to preserve change_count) are excluded.
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
    if (!row.emoji) continue
    map[row.emoji] = (map[row.emoji] ?? 0) + 1
  }
  return Object.entries(map).map(([emoji, count]) => ({ emoji, count }))
}

// GET /api/reactions?type=article&id=xxx&visitor_id=yyy
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type       = searchParams.get('type')
  const id         = searchParams.get('id')
  const visitorId  = searchParams.get('visitor_id')

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

  let myReaction: string | null = null
  let changesRemaining = MAX_CHANGES
  if (visitorId) {
    const { data: mine } = await supabase
      .from('reactions')
      .select('emoji, change_count')
      .eq('content_type', type)
      .eq('content_id', id)
      .eq('visitor_id', visitorId)
      .maybeSingle()

    if (mine) {
      myReaction = mine.emoji
      changesRemaining = Math.max(0, MAX_CHANGES - mine.change_count)
    }
  }

  return NextResponse.json({ reactions: counts, myReaction, changesRemaining }, {
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

    const anonDb    = db()
    const mutationDb = serviceDb()

    // ── Check for existing reaction (anon read — covered by reactions_anon_select) ──
    const { data: existing, error: selectErr } = await anonDb
      .from('reactions')
      .select('id, emoji, change_count')
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .eq('visitor_id', visitor_id)
      .maybeSingle()

    if (selectErr) {
      console.error('[reactions] SELECT existing error:', selectErr.message)
      return NextResponse.json(
        { error: 'Could not check existing reaction.', detail: selectErr.message },
        { status: 500 },
      )
    }

    let myReaction: string | null
    let changesRemaining: number

    // ── Mutate (service role — bypasses RLS for UPDATE/DELETE) ─────────────
    if (existing) {
      // The visitor already has a row for this post. Any further change —
      // switching emoji, or toggling the same one off — costs one of their
      // MAX_CHANGES changes. Once used up, the request is a no-op: we return
      // their current (unchanged) state instead of erroring.
      if (existing.change_count >= MAX_CHANGES) {
        myReaction = existing.emoji
        changesRemaining = 0
      } else {
        const nextEmoji = existing.emoji === emoji ? null : emoji // toggle off if same, else switch
        const { error: updErr } = await mutationDb
          .from('reactions')
          .update({ emoji: nextEmoji, change_count: existing.change_count + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id)

        if (updErr) {
          console.error('[reactions] UPDATE error:', updErr.message)
          return NextResponse.json(
            { error: 'Could not update reaction.', detail: updErr.message },
            { status: 500 },
          )
        }
        myReaction = nextEmoji
        changesRemaining = MAX_CHANGES - (existing.change_count + 1)
      }
    } else {
      // First-ever reaction on this post — free, doesn't count as a change.
      const { error: insErr } = await mutationDb
        .from('reactions')
        .insert({ content_type, content_id, emoji, visitor_id, change_count: 0 })

      if (insErr) {
        console.error('[reactions] INSERT error:', insErr.message)
        return NextResponse.json(
          { error: 'Could not save reaction.', detail: insErr.message },
          { status: 500 },
        )
      }
      myReaction = emoji
      changesRemaining = MAX_CHANGES
    }

    // ── Return updated counts (anon read) ──────────────────────────────────
    const reactions = await getCounts(anonDb, content_type, content_id)

    if (reactions === null) {
      // Write succeeded but we can't read back. Return optimistic success
      // so the client keeps its optimistic count rather than resetting to 0.
      console.error('[reactions] write OK but getCounts failed — RLS SELECT policy needed')
      return NextResponse.json({ success: true, reactions: 'recount_failed', myReaction, changesRemaining })
    }

    return NextResponse.json({ success: true, reactions, myReaction, changesRemaining })

  } catch (err) {
    console.error('[reactions] unhandled error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
