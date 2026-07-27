import { createBrowserClient } from '@supabase/ssr'

// createBrowserClient already caches and reuses a single client per browser
// tab internally (see its `isSingleton` behavior) — no manual caching needed here.
export function getAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
