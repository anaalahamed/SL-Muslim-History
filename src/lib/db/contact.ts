import { ContactMessage } from '../types'

const KEY = 'slmh_contact_messages'

export function getMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as ContactMessage[]
  } catch {
    return []
  }
}

export function saveMessage(data: Omit<ContactMessage, 'id' | 'received_at' | 'read'>): ContactMessage {
  const message: ContactMessage = {
    ...data,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    received_at: new Date().toISOString(),
    read: false,
  }
  const all = getMessages()
  all.unshift(message)
  localStorage.setItem(KEY, JSON.stringify(all))
  return message
}

export function markRead(id: string): void {
  const all = getMessages().map((m) => m.id === id ? { ...m, read: true } : m)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function markAllRead(): void {
  const all = getMessages().map((m) => ({ ...m, read: true }))
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function deleteMessage(id: string): void {
  const all = getMessages().filter((m) => m.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getUnreadCount(): number {
  return getMessages().filter((m) => !m.read).length
}
