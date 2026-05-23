import { supabase } from '../supabase'
import { ContactMessage } from '../types'

export async function getMessages(): Promise<ContactMessage[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('received_at', { ascending: false })
  if (error || !data) return []
  return data as ContactMessage[]
}

export async function saveMessage(data: Omit<ContactMessage, 'id' | 'received_at' | 'read'>): Promise<ContactMessage | null> {
  if (!supabase) return null
  const { data: saved, error } = await supabase
    .from('contact_messages')
    .insert({ ...data, received_at: new Date().toISOString(), read: false })
    .select()
    .single()
  if (error) return null
  return saved as ContactMessage
}

export async function markRead(id: string): Promise<void> {
  if (!supabase) return
  await supabase.from('contact_messages').update({ read: true }).eq('id', id)
}

export async function markAllRead(): Promise<void> {
  if (!supabase) return
  await supabase.from('contact_messages').update({ read: true }).eq('read', false)
}

export async function deleteMessage(id: string): Promise<void> {
  if (!supabase) return
  await supabase.from('contact_messages').delete().eq('id', id)
}

export async function getUnreadCount(): Promise<number> {
  if (!supabase) return 0
  const { count } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
  return count ?? 0
}
