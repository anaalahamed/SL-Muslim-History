'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD_KEY = 'slmh_admin_password'
const ADMIN_USERNAME_KEY = 'slmh_admin_username'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPwd,  setShowPwd]  = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      const storedPwd  = localStorage.getItem(ADMIN_PASSWORD_KEY) ?? 'admin123'
      const storedUser = localStorage.getItem(ADMIN_USERNAME_KEY) ?? 'admin'

      if (username === storedUser && password === storedPwd) {
        sessionStorage.setItem('slmh_admin_auth', 'true')
        router.push('/admin')
      } else {
        setError('Incorrect username or password.')
        setLoading(false)
        setPassword('')
      }
    }, 600)
  }

  const inputBase = {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const inputError = { ...inputBase, border: '1px solid #dc2626' }
  const inputFocus = { borderColor: '#4a9e1f', boxShadow: '0 0 0 3px rgba(74,158,31,0.12)' }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d2e1b 0%, #152d1a 55%, #0a2213 100%)' }}
    >
      {/* Radial glows */}
      <div className="absolute pointer-events-none" style={{ top: '-120px', left: '-120px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(74,158,31,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-80px', right: '-80px', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #f0d060 50%, #c9a84c 70%, transparent)' }} />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}
        >

          {/* Card header */}
          <div
            className="px-8 pt-10 pb-8 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #1a3a0f 0%, #2a5c18 100%)' }}
          >
            {/* Subtle arc decoration */}
            <div className="absolute pointer-events-none" style={{ top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
            <div className="absolute pointer-events-none" style={{ top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.1)' }} />

            <div className="inline-block rounded-2xl mb-5 relative z-10" style={{ background: 'white', padding: '10px 16px' }}>
              <Image
                src="/logo.png"
                alt="SL Muslim History"
                width={120}
                height={52}
                style={{ height: '52px', width: 'auto', display: 'block' }}
              />
            </div>
            <div className="w-10 h-0.5 mx-auto mb-3" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>Admin Panel</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-extrabold mb-1" style={{ color: '#0f172a' }}>Welcome back</h2>
            <p className="text-xs mb-7" style={{ color: '#94a3b8' }}>Sign in to manage your site.</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Username */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Username</label>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError('') }}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={error ? inputError : inputBase}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, error ? inputError : inputBase)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                    style={error ? inputError : inputBase}
                    onFocus={(e) => Object.assign(e.currentTarget.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, error ? inputError : inputBase)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#475569' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}
                  >
                    {showPwd ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: loading || !username || !password ? '#cbd5e1' : '#4a9e1f',
                  color: 'white',
                  cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
                  boxShadow: loading || !username || !password ? 'none' : '0 4px 16px rgba(74,158,31,0.35)',
                }}
                onMouseEnter={(e) => {
                  if (!loading && username && password) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(74,158,31,0.45)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = loading || !username || !password ? 'none' : '0 4px 16px rgba(74,158,31,0.35)'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In →'
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            ← Back to main site
          </a>
        </div>

      </div>
    </div>
  )
}
