import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Diagnostic endpoint — tests whether the anon key can INSERT/SELECT/UPDATE/DELETE
// on the reactions table. Visit /api/check-reactions to see the full RLS status.
export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const db = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const TEST_ID      = '__rls_test__'
  const TEST_TYPE    = 'article'
  const TEST_EMOJI   = '👍'
  const TEST_VISITOR = 'rls_test_visitor_000'

  const results: Record<string, { ok: boolean; error?: string }> = {}

  // ── 1. INSERT ──────────────────────────────────────────────────────────────
  const { error: insErr } = await db.from('reactions').insert({
    content_type: TEST_TYPE,
    content_id:   TEST_ID,
    emoji:        TEST_EMOJI,
    visitor_id:   TEST_VISITOR,
  })
  results.INSERT = { ok: !insErr, error: insErr?.message }

  // ── 2. SELECT ──────────────────────────────────────────────────────────────
  const { data: selData, error: selErr } = await db
    .from('reactions')
    .select('id, emoji')
    .eq('content_id', TEST_ID)
    .eq('visitor_id', TEST_VISITOR)
    .maybeSingle()
  results.SELECT = { ok: !selErr && selData !== null, error: selErr?.message ?? (selData ? undefined : 'row not found') }

  // ── 3. UPDATE ──────────────────────────────────────────────────────────────
  if (selData?.id) {
    const { error: updErr } = await db
      .from('reactions')
      .update({ emoji: '❤️' })
      .eq('id', selData.id)
    results.UPDATE = { ok: !updErr, error: updErr?.message }
  } else {
    results.UPDATE = { ok: false, error: 'skipped — SELECT failed' }
  }

  // ── 4. DELETE ──────────────────────────────────────────────────────────────
  const { error: delErr } = await db
    .from('reactions')
    .delete()
    .eq('content_id', TEST_ID)
    .eq('visitor_id', TEST_VISITOR)
  results.DELETE = { ok: !delErr, error: delErr?.message }

  // ── Summary ───────────────────────────────────────────────────────────────
  const allOk = Object.values(results).every((r) => r.ok)

  const RLS_SQL = `
-- Step 1: grant table-level access to the anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE reactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE reactions TO authenticated;

-- Step 2: enable RLS and create permissive policies
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select" ON reactions;
CREATE POLICY "reactions_select" ON reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON reactions;
CREATE POLICY "reactions_insert" ON reactions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "reactions_update" ON reactions;
CREATE POLICY "reactions_update" ON reactions
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reactions_delete" ON reactions;
CREATE POLICY "reactions_delete" ON reactions
  FOR DELETE USING (true);
`.trim()

  return NextResponse.json({
    all_ok: allOk,
    operations: results,
    diagnosis: allOk
      ? 'All operations succeed. RLS is correctly configured.'
      : 'One or more operations are blocked by RLS. Run the SQL below in your Supabase SQL Editor.',
    fix_sql: allOk ? null : RLS_SQL,
  })
}
