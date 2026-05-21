import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Returns null when env vars are not configured — db functions fall back to mock data
export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null
