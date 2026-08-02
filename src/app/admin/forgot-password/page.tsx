'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getAuthClient } from '@/lib/supabase-auth'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await getAuthClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })
    // Always show the same "check your email" message regardless of
    // whether the address is registered — so this page can't be used to
    // discover the admin's email.
    setSent(true)
    setLoading(false)
  }

  const inputBase = {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

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
            {sent ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-lg font-extrabold mb-2" style={{ color: '#0f172a' }}>Check your email</h2>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  If <strong>{email}</strong> is registered, a password reset link has been sent. Open it to choose a new password.
                </p>
                <a href="/admin/login" className="inline-block mt-6 text-sm font-bold" style={{ color: '#4a9e1f' }}>
                  ← Back to sign in
                </a>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-extrabold mb-1" style={{ color: '#0f172a' }}>Reset your password</h2>
                <p className="text-xs mb-7" style={{ color: '#94a3b8' }}>
                  Enter your admin email and we&apos;ll send you a link to set a new password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Email</label>
                    <input
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={inputBase}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#4a9e1f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.12)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
                    style={{
                      background: loading || !email ? '#cbd5e1' : '#4a9e1f',
                      color: 'white',
                      cursor: loading || !email ? 'not-allowed' : 'pointer',
                      boxShadow: loading || !email ? 'none' : '0 4px 16px rgba(74,158,31,0.35)',
                    }}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link →'}
                  </button>
                </form>
                <div className="text-center mt-5">
                  <a href="/admin/login" className="text-xs font-semibold" style={{ color: '#64748b' }}>
                    ← Back to sign in
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
