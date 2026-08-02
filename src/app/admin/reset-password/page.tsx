'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthClient } from '@/lib/supabase-auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready,    setReady]    = useState(false) // recovery link verified
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  // Clicking the emailed link logs the browser into a temporary recovery
  // session — Supabase fires this event once that session is established.
  useEffect(() => {
    const supabase = getAuthClient()
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // If the tab already processed the recovery link before this listener
    // attached, a valid session will already be present.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error: updateError } = await getAuthClient().auth.updateUser({ password })
    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    setDone(true)
    setTimeout(() => router.push('/admin'), 1500)
  }

  const inputBase = {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const inputError = { ...inputBase, border: '1px solid #dc2626' }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d2e1b 0%, #152d1a 55%, #0a2213 100%)' }}
    >
      <div className="absolute pointer-events-none" style={{ top: '-120px', left: '-120px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(74,158,31,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-80px', right: '-80px', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div className="absolute top-0 left-0 right-0" style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #f0d060 50%, #c9a84c 70%, transparent)' }} />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>
          <div
            className="px-8 pt-10 pb-8 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #1a3a0f 0%, #2a5c18 100%)' }}
          >
            <div className="inline-block rounded-2xl mb-5 relative z-10" style={{ background: 'white', padding: '10px 16px' }}>
              <Image src="/logo.png" alt="SL Muslim History" width={120} height={52} style={{ height: '52px', width: 'auto', display: 'block' }} />
            </div>
            <div className="w-10 h-0.5 mx-auto mb-3" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Admin Panel</p>
          </div>

          <div className="px-8 py-8">
            {done ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-lg font-extrabold mb-2" style={{ color: '#0f172a' }}>Password updated!</h2>
                <p className="text-sm" style={{ color: '#64748b' }}>Taking you to the dashboard...</p>
              </div>
            ) : !ready ? (
              <div className="text-center py-4">
                <div className="w-8 h-8 mx-auto mb-4 rounded-full border-2 animate-spin" style={{ borderColor: '#4a9e1f', borderTopColor: 'transparent' }} />
                <p className="text-sm" style={{ color: '#64748b' }}>
                  Verifying your reset link...
                </p>
                <p className="text-xs mt-4" style={{ color: '#94a3b8' }}>
                  If this doesn&apos;t finish in a few seconds, the link may have expired —{' '}
                  <a href="/admin/forgot-password" className="font-bold" style={{ color: '#4a9e1f' }}>request a new one</a>.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-extrabold mb-1" style={{ color: '#0f172a' }}>Choose a new password</h2>
                <p className="text-xs mb-7" style={{ color: '#94a3b8' }}>Make it something you&apos;ll remember.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>New Password</label>
                    <input
                      type="password"
                      required
                      autoFocus
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={error ? inputError : inputBase}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.12)' }}
                      onBlur={(e) => Object.assign(e.currentTarget.style, error ? inputError : inputBase)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Confirm Password</label>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError('') }}
                      placeholder="Re-enter your new password"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={error ? inputError : inputBase}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.12)' }}
                      onBlur={(e) => Object.assign(e.currentTarget.style, error ? inputError : inputBase)}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !password || !confirm}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
                    style={{
                      background: loading || !password || !confirm ? '#cbd5e1' : '#4a9e1f',
                      color: 'white',
                      cursor: loading || !password || !confirm ? 'not-allowed' : 'pointer',
                      boxShadow: loading || !password || !confirm ? 'none' : '0 4px 16px rgba(74,158,31,0.35)',
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Password →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
