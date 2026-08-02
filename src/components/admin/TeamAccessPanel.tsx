'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAuthClient } from '@/lib/supabase-auth'
import { AdminPermissions, PERMISSION_FIELDS } from '@/lib/permissions'

const emptyForm = { name: '', email: '', password: '' }

export default function TeamAccessPanel() {
  const [members, setMembers] = useState<AdminPermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [newPerms, setNewPerms] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [removeTarget, setRemoveTarget] = useState<AdminPermissions | null>(null)
  const [removing, setRemoving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await getAuthClient().from('admin_permissions').select('*').order('created_at', { ascending: true })
    setMembers((data ?? []) as AdminPermissions[])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  function toggleNewPerm(key: string) {
    setNewPerms((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function togglePerm(member: AdminPermissions, key: string) {
    const value = !(member as unknown as Record<string, boolean>)[key]
    setMembers((prev) => prev.map((m) => (m.user_id === member.user_id ? { ...m, [key]: value } : m)))
    await getAuthClient().from('admin_permissions').update({ [key]: value }).eq('user_id', member.user_id)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const session = await getAuthClient().auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Could not create the account.'); setCreating(false); return }

      if (newPerms.size > 0) {
        const updates: Record<string, boolean> = {}
        newPerms.forEach((k) => { updates[k] = true })
        await getAuthClient().from('admin_permissions').update(updates).eq('user_id', json.userId)
      }

      setForm(emptyForm)
      setNewPerms(new Set())
      setCreating(false)
      load()
    } catch {
      setError('Something went wrong. Please try again.')
      setCreating(false)
    }
  }

  async function handleRemove() {
    if (!removeTarget) return
    setRemoving(true)
    const session = await getAuthClient().auth.getSession()
    const token = session.data.session?.access_token
    await fetch('/api/admin/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: removeTarget.user_id }),
    })
    setRemoving(false)
    setRemoveTarget(null)
    load()
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none"
  const inputStyle = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Team Access</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
          Give someone else (your wife, a writer) their own login — with only the sections you choose. They never see anything you don&apos;t grant them.
        </p>
      </div>

      {/* Add new member */}
      <form onSubmit={handleCreate} className="p-6 space-y-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: '#94a3b8' }}>Add a Team Member</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fathima" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="their@email.com" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Password</label>
            <input type="text" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-2" style={{ color: '#334155' }}>What can they access?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PERMISSION_FIELDS.map((f) => (
              <label
                key={f.key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                style={{
                  border: `1px solid ${newPerms.has(f.key) ? '#4a9e1f' : '#e2e8f0'}`,
                  background: newPerms.has(f.key) ? '#f0fdf4' : 'white',
                  color: newPerms.has(f.key) ? '#4a9e1f' : '#64748b',
                }}
              >
                <input type="checkbox" checked={newPerms.has(f.key)} onChange={() => toggleNewPerm(f.key)} className="accent-green-600" />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="px-3 py-2.5 rounded-xl text-xs font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: creating ? '#94a3b8' : '#4a9e1f' }}
        >
          {creating ? 'Creating...' : '+ Create Account'}
        </button>
      </form>

      {/* Existing members */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: '#94a3b8' }}>Current Team ({members.length})</h3>
      </div>
      {loading ? (
        <p className="text-sm px-6 py-8 text-center" style={{ color: '#94a3b8' }}>Loading...</p>
      ) : members.length === 0 ? (
        <p className="text-sm px-6 py-8 text-center" style={{ color: '#94a3b8' }}>No one else has access yet — you&apos;re the only admin.</p>
      ) : (
        <div>
          {members.map((m, i) => (
            <div key={m.user_id} className="p-6" style={{ borderBottom: i < members.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{m.name || m.email}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{m.email}</p>
                </div>
                <button
                  onClick={() => setRemoveTarget(m)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                  style={{ border: '1px solid #fca5a5', color: '#dc2626', background: 'white' }}
                >
                  Remove Access
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PERMISSION_FIELDS.map((f) => {
                  const active = Boolean((m as unknown as Record<string, boolean>)[f.key])
                  return (
                    <label
                      key={f.key}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                      style={{
                        border: `1px solid ${active ? '#4a9e1f' : '#e2e8f0'}`,
                        background: active ? '#f0fdf4' : '#f8fafc',
                        color: active ? '#4a9e1f' : '#64748b',
                      }}
                    >
                      <input type="checkbox" checked={active} onChange={() => togglePerm(m, f.key)} className="accent-green-600" />
                      {f.label}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remove confirmation */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h3 className="text-base font-extrabold text-center mb-2" style={{ color: '#0f172a' }}>Remove {removeTarget.name || removeTarget.email}?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>
              They will no longer be able to log in at all. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#f1f5f9', color: '#475569' }}>
                Cancel
              </button>
              <button onClick={handleRemove} disabled={removing} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#dc2626' }}>
                {removing ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
