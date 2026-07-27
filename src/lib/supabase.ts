import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Trim both values so a stray whitespace in the Vercel env var never produces
// a client whose apikey header is a blank string (which causes 401 "No API key found").
const url  = (process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '').trim()
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

// Returns null when env vars are not configured — db functions fall back to mock data.
// The global fetch override sets cache: 'no-store' so that Next.js's extended fetch
// does not cache Supabase HTTP responses in the server-side data cache.
// This client only ever does public, anonymous reads — it never needs a
// logged-in session (the admin panel uses its own client from
// lib/supabase-auth.ts for that). Disabling session persistence stops it
// from creating its own GoTrueClient watching the same browser storage key
// as the admin client, which otherwise triggers Supabase's "Multiple
// GoTrueClient instances" warning whenever both are active on one page.
export const supabase: SupabaseClient | null =
  url && anon
    ? createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init = {}) =>
            fetch(input as RequestInfo, { ...init, cache: 'no-store' }),
        },
      })
    : null
