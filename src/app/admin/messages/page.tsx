'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContactMessage } from '@/lib/types'
import { getMessages, markRead, markAllRead, deleteMessage } from '@/lib/db/contact'

const reasonColors: Record<string, { bg: string; color: string }> = {
  'Submit an Article':         { bg: '#dbeafe', color: '#1d4ed8' },
  'Research Inquiry':          { bg: '#fef3c7', color: '#92400e' },
  'Partnership / Collaboration':{ bg: '#d1fae5', color: '#065f46' },
  'Share Historical Photos':   { bg: '#ede9fe', color: '#5b21b6' },
  'Report an Error':           { bg: '#fee2e2', color: '#991b1b' },
  'General Enquiry':           { bg: '#f0fdf4', color: '#166534' },
}

export default function MessagesPage() {
  const [messages,  setMessages]  = useState<ContactMessage[]>([])
  const [selected,  setSelected]  = useState<ContactMessage | null>(null)
  const [filter,    setFilter]    = useState<'all' | 'unread'>('all')
  const [deleting,  setDeleting]  = useState<string | null>(null)

  const load = useCallback(async () => {
    const msgs = await getMessages()
    setMessages(msgs)
  }, [])
  useEffect(() => { load() }, [load])

  const unreadCount = messages.filter((m) => !m.read).length

  const visible = filter === 'unread' ? messages.filter((m) => !m.read) : messages

  async function openMessage(msg: ContactMessage) {
    setSelected(msg)
    if (!msg.read) {
      await markRead(msg.id)
      load()
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await deleteMessage(id)
    if (selected?.id === id) setSelected(null)
    load()
    setDeleting(null)
  }

  async function handleMarkAllRead() {
    await markAllRead()
    load()
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1)  return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffH = Math.floor(diffMins / 60)
    if (diffH < 24)    return `${diffH}h ago`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7)     return `${diffD}d ago`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: '#0f172a' }}>
            Contact Messages
            {unreadCount > 0 && (
              <span
                className="ml-2 text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: '#dc2626', color: 'white' }}
              >
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ border: '1px solid #e2e8f0', color: '#64748b', background: 'white' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.color = '#4a9e1f' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
            >
              Mark all read
            </button>
          )}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid #e2e8f0' }}
          >
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter === f ? '#4a9e1f' : 'white',
                  color:      filter === f ? 'white'    : '#64748b',
                }}
              >
                {f === 'unread' ? `Unread (${unreadCount})` : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {messages.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: 'white', border: '1px solid #e2e8f0' }}
        >
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-base font-extrabold mb-2" style={{ color: '#0f172a' }}>No messages yet</h3>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Messages submitted via the contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="flex gap-5" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>

          {/* Message list */}
          <div
            className="flex flex-col overflow-y-auto rounded-2xl flex-shrink-0"
            style={{
              width: selected ? '340px' : '100%',
              background: 'white',
              border: '1px solid #e2e8f0',
            }}
          >
            {visible.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold" style={{ color: '#64748b' }}>All caught up!</p>
              </div>
            ) : (
              visible.map((msg) => {
                const rc = reasonColors[msg.reason] ?? { bg: '#f1f5f9', color: '#475569' }
                const isOpen = selected?.id === msg.id
                return (
                  <div
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className="cursor-pointer transition-all"
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isOpen ? '#f0fdf4' : msg.read ? 'white' : '#fafffe',
                      borderLeft: `3px solid ${isOpen ? '#4a9e1f' : msg.read ? 'transparent' : '#4a9e1f'}`,
                    }}
                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = msg.read ? 'white' : '#fafffe' }}
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {!msg.read && (
                            <span
                              className="flex-shrink-0 w-2 h-2 rounded-full"
                              style={{ background: '#4a9e1f' }}
                            />
                          )}
                          <span
                            className="font-bold text-sm truncate"
                            style={{ color: msg.read ? '#334155' : '#0f172a' }}
                          >
                            {msg.name}
                          </span>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>
                          {formatDate(msg.received_at)}
                        </span>
                      </div>
                      <div className="text-xs mb-1.5 truncate" style={{ color: '#64748b' }}>
                        {msg.email}
                      </div>
                      {msg.reason && (
                        <span
                          className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                          style={{ background: rc.bg, color: rc.color }}
                        >
                          {msg.reason}
                        </span>
                      )}
                      <p
                        className="text-xs line-clamp-2"
                        style={{ color: '#94a3b8', lineHeight: '1.6' }}
                      >
                        {msg.message}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div
              className="flex-1 min-w-0 rounded-2xl overflow-hidden flex flex-col"
              style={{ background: 'white', border: '1px solid #e2e8f0' }}
            >
              {/* Detail header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}
              >
                <div className="min-w-0">
                  <h2 className="font-extrabold text-base truncate" style={{ color: '#0f172a' }}>
                    {selected.name}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    {selected.email} · {formatDate(selected.received_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.reason || 'Your message')}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                    style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.25)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Reply
                  </a>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting === selected.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ border: '1px solid #fca5a5', color: '#dc2626', background: 'white' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: '#94a3b8', border: '1px solid #e2e8f0' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 overflow-y-auto p-6">
                {selected.reason && (
                  <div className="mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                      Reason
                    </span>
                    <div className="mt-1.5">
                      {(() => {
                        const rc = reasonColors[selected.reason] ?? { bg: '#f1f5f9', color: '#475569' }
                        return (
                          <span
                            className="inline-block text-sm font-semibold px-3 py-1 rounded-full"
                            style={{ background: rc.bg, color: rc.color }}
                          >
                            {selected.reason}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                    Message
                  </span>
                  <div
                    className="mt-3 p-5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', lineHeight: '1.9' }}
                  >
                    {selected.message}
                  </div>
                </div>

                <div
                  className="mt-6 flex items-center gap-6 text-xs"
                  style={{ color: '#94a3b8' }}
                >
                  <div>
                    <span className="font-bold uppercase tracking-wider">Received</span>
                    <div className="mt-0.5 font-semibold" style={{ color: '#64748b' }}>
                      {new Date(selected.received_at).toLocaleString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider">Status</span>
                    <div className="mt-0.5 font-semibold" style={{ color: '#22c55e' }}>Read</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
