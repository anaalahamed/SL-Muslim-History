import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Trim both values so a stray whitespace in the Vercel env var never produces
// a client whose apikey header is a blank string (which causes 401 "No API key found").
const url  = (process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '').trim()
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

// Returns null when env vars are not configured — db functions fall back to mock data.
// The global fetch override sets cache: 'no-store' so that Next.js's extended fetch
// does not cache Supabase HTTP responses in the server-side data cache.
export const supabase: SupabaseClient | null =
  url && anon
    ? createClient(url, anon, {
        global: {
          fetch: (input, init = {}) =>
            fetch(input as RequestInfo, { ...init, cache: 'no-store' }),
        },
      })
    : null
