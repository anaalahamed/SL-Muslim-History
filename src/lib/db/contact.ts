import { supabase } from '../supabase'
import { ContactMessage } from '../types'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function getMessages(client?: SupabaseClient): Promise<ContactMessage[]> {
  const db = client ?? supabase
  if (!db) return []
  const { data, error } = await db
    .from('contact_messages')
    .select('*')
    .order('received_at', { ascending: false })
  if (error || !data) return []
  return data as ContactMessage[]
}

// Anon visitors can only INSERT into contact_messages (not read it back —
// otherwise they could read other people's messages), so this must NOT
// chain .select()/.single() after the insert: Postgres RLS treats
// INSERT...RETURNING as needing SELECT visibility on the new row, and
// rejects (rolls back) the whole insert when that's missing. A plain
// insert with no RETURNING isn't subject to that check.
export async function saveMessage(data: Omit<ContactMessage, 'id' | 'received_at' | 'read'>): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('contact_messages')
    .insert({ ...data, received_at: new Date().toISOString(), read: false })
  return !error
}

export async function markRead(id: string, client?: SupabaseClient): Promise<void> {
  const db = client ?? supabase
  if (!db) return
  await db.from('contact_messages').update({ read: true }).eq('id', id)
}

export async function markAllRead(client?: SupabaseClient): Promise<void> {
  const db = client ?? supabase
  if (!db) return
  await db.from('contact_messages').update({ read: true }).eq('read', false)
}

export async function deleteMessage(id: string, client?: SupabaseClient): Promise<void> {
  const db = client ?? supabase
  if (!db) return
  await db.from('contact_messages').delete().eq('id', id)
}

export async function getUnreadCount(client?: SupabaseClient): Promise<number> {
  const db = client ?? supabase
  if (!db) return 0
  const { count } = await db
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
  return count ?? 0
}
