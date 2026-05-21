'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Subscriber {
  id: string
  email: string
  subscribed_at: string
}

export default function AdminNewsletterPage() {
  const [subscribers,  setSubscribers]  = useState<Subscriber[]>([])
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState<'subscribers' | 'compose'>('subscribers')
  const [search,       setSearch]       = useState('')
  const [deleteId,     setDeleteId]     = useState<string | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  // Compose state
  const [subject,  setSubject]  = useState('')
  const [body,     setBody]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)

  useEffect(() => {
    loadSubscribers()
    localStorage.setItem('slmh_newsletter_last_viewed', new Date().toISOString())
  }, [])

  async function loadSubscribers() {
    setLoading(true)
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
    setSubscribers(data ?? [])
    setLoading(false)
  }

  async function doDelete() {
    if (!deleteId || !supabase) return
    setDeleting(true)
    await supabase.from('newsletter_subscribers').delete().eq('id', deleteId)
    setSubscribers((prev) => prev.filter((s) => s.id !== deleteId))
    setDeleteId(null)
    setDeleting(false)
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1000)
  }

  const filtered = subscribers.filter((s) =>
    search.trim() === '' || s.email.toLowerCase().includes(search.toLowerCase())
  )

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#4a9e1f'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold" style={{ color: '#0f172a' }}>Newsletter</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Manage subscribers and send newsletters</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: subscribers.length, icon: '👥', color: '#4a9e1f', bg: '#f0fdf4' },
          { label: 'This Month',        value: subscribers.filter((s) => new Date(s.subscribed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: '📈', color: '#0369a1', bg: '#f0f9ff' },
          { label: 'Campaigns Sent',    value: 0, icon: '📨', color: '#7c3aed', bg: '#f5f3ff' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        {([
          { key: 'subscribers', label: 'Subscribers', icon: '👥' },
          { key: 'compose',     label: 'Compose',     icon: '✍️' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-1 justify-center transition-all"
            style={{ background: tab === t.key ? '#4a9e1f' : 'transparent', color: tab === t.key ? 'white' : '#64748b' }}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.key === 'subscribers' && (
              <span
                className="text-xs font-black px-1.5 py-0.5 rounded-full"
                style={{ background: tab === t.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: tab === t.key ? 'white' : '#64748b' }}
              >
                {subscribers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Subscribers tab ── */}
      {tab === 'subscribers' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="rounded-2xl p-3 flex flex-col sm:flex-row gap-3" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#94a3b8' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.1)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
            <span className="flex items-center text-xs font-semibold px-2" style={{ color: '#94a3b8' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div
              className="grid gap-4 px-5 py-3 text-xs font-black uppercase tracking-wider"
              style={{ gridTemplateColumns: 'auto 1fr auto auto', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', color: '#94a3b8' }}
            >
              <span></span>
              <span>Email</span>
              <span>Subscribed</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm" style={{ color: '#94a3b8' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold" style={{ color: '#64748b' }}>
                  {subscribers.length === 0 ? 'No subscribers yet' : 'No results found'}
                </p>
              </div>
            ) : (
              filtered.map((sub, i) => (
                <div
                  key={sub.id}
                  className="grid gap-4 px-5 py-3.5 items-center transition-colors"
                  style={{ gridTemplateColumns: 'auto 1fr auto auto', borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: '#4a9e1f' }}
                  >
                    {sub.email[0].toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{sub.email}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {new Date(sub.subscribed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <button
                    onClick={() => setDeleteId(sub.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                    style={{ background: '#fef2f2', color: '#dc2626' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Compose tab ── */}
      {tab === 'compose' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <h3 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Send Newsletter</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Will be sent to {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
          </div>

          {sent ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📨</div>
              <h3 className="text-xl font-extrabold mb-2" style={{ color: '#0f172a' }}>Newsletter Queued!</h3>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>Connect Supabase Edge Functions to send real emails.</p>
              <button onClick={() => { setSent(false); setSubject(''); setBody('') }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f' }}>
                Compose Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="p-6 space-y-5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span className="text-xl">👥</span>
                <p className="text-sm font-bold" style={{ color: '#15803d' }}>{subscribers.length} subscribers will receive this</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Subject Line <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="புதிய கட்டுரைகள் — March 2026" className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea required rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder={"அஸ்ஸலாமு அலைக்கும்,\n\nசிறப்பான வாசகர்களே..."} className={inputClass} style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Noto Sans Tamil', sans-serif", lineHeight: '1.8' }} onFocus={focus} onBlur={blur} />
              </div>

              <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                <span className="text-base mt-0.5">⚠️</span>
                <p>Email sending requires <strong>Supabase Edge Functions</strong>. Currently in preview mode — no actual emails will be sent.</p>
              </div>

              <button type="submit" disabled={sending} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all" style={{ background: sending ? '#94a3b8' : '#4a9e1f' }}>
                {sending ? 'Sending...' : `📨 Send to ${subscribers.length} Subscribers`}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h3 className="text-base font-extrabold text-center mb-2" style={{ color: '#0f172a' }}>Remove Subscriber?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>This subscriber will be permanently removed from your list.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all" style={{ background: '#f1f5f9', color: '#475569' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9' }}>
                Cancel
              </button>
              <button onClick={doDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all" style={{ background: deleting ? '#94a3b8' : '#dc2626' }} onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = '#b91c1c' }} onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.background = '#dc2626' }}>
                {deleting ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
