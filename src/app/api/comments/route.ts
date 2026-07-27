import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function stripHtml(str: string): string {
  return str
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}

function isValidEmail(email: string): boolean {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const MAX_COMMENTS_PER_POST = 2

// GET /api/comments?article_id=xxx&visitor_id=yyy
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const articleId = searchParams.get('article_id')
  const visitorId = searchParams.get('visitor_id')

  if (!articleId) return NextResponse.json({ error: 'Missing article_id' }, { status: 400 })

  const supabase = db()
  // Email is intentionally not selected here — it's for admin use only,
  // never shown to the public.
  const { data, error } = await supabase
    .from('comments')
    .select('id, name, content, created_at')
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  // Count this visitor's own comments on this post (any status) so the
  // client can show/hide the form without waiting for a rejected submit.
  let myCount = 0
  if (visitorId) {
    const { count } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('article_id', articleId)
      .eq('visitor_id', visitorId)
    myCount = count ?? 0
  }

  if (error) return NextResponse.json({ comments: [], myCount }, { status: 200 })
  return NextResponse.json({ comments: data ?? [], myCount }, { headers: { 'Cache-Control': 'no-store' } })
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { article_id, name, content, email, visitor_id, hp } = body

    // Honeypot — bots fill hidden field
    if (hp) return NextResponse.json({ error: 'Spam detected', code: 'SPAM' }, { status: 400 })

    // Required field validation
    if (!article_id || !name || !content || !visitor_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const cleanName    = stripHtml(String(name)).slice(0, 60)
    const cleanContent = stripHtml(String(content)).slice(0, 1000)
    const cleanEmail   = email ? String(email).trim().slice(0, 200) : null

    if (cleanName.length < 2) {
      return NextResponse.json({ error: 'Name too short' }, { status: 400 })
    }
    if (cleanContent.length < 10) {
      return NextResponse.json({ error: 'Comment too short (min 10 characters)' }, { status: 400 })
    }
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (typeof visitor_id !== 'string' || visitor_id.length > 200) {
      return NextResponse.json({ error: 'Invalid visitor_id' }, { status: 400 })
    }

    const supabase = db()

    // Per-post limit: max MAX_COMMENTS_PER_POST comments per visitor per article
    // (the only comment-count rule — no separate hourly rate limit)
    const { count: postCount } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('article_id', article_id)
      .eq('visitor_id', visitor_id)

    if ((postCount ?? 0) >= MAX_COMMENTS_PER_POST) {
      return NextResponse.json(
        { error: `You've already posted the maximum of ${MAX_COMMENTS_PER_POST} comments on this post.`, code: 'POST_LIMIT' },
        { status: 429 },
      )
    }

    // Block check
    const { data: blocked } = await supabase
      .from('comment_blocks')
      .select('id')
      .eq('visitor_id', visitor_id)
      .maybeSingle()

    if (blocked) {
      return NextResponse.json({ error: 'Commenting is not available for your account.', code: 'SPAM' }, { status: 403 })
    }

    // Get IP hash for logging
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'
    let ipHash = ''
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + ':slmh26'))
      ipHash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
    } catch { /* optional field */ }

    const { error } = await supabase.from('comments').insert({
      article_id: String(article_id).slice(0, 200),
      name:       cleanName,
      website:    cleanEmail, // column is named "website" but now stores the commenter's email (admin-only)
      content:    cleanContent,
      visitor_id: String(visitor_id).slice(0, 200),
      ip_hash:    ipHash,
      status:     'pending',
    })

    if (error) {
      console.error('[comments] INSERT error:', error.message, error.details, error.hint)
      return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Comment submitted for moderation' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
