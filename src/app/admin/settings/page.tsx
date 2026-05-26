'use client'

import { useState, useEffect } from 'react'
import { getAdminConfig, saveAdminConfig, saveSocialLinksToSupabase, defaultConfig, AdminConfig, TeamMember, Stat } from '@/lib/adminConfig'

const ADMIN_PASSWORD_KEY = 'slmh_admin_password'

export default function SettingsPage() {
  const [config,    setConfig]    = useState<AdminConfig>(defaultConfig)
  const [saved,     setSaved]     = useState(false)
  const [tab,       setTab]       = useState<'general' | 'social' | 'content' | 'seo' | 'announcement' | 'account'>('general')
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [curPwd,    setCurPwd]    = useState('')
  const [newPwd,    setNewPwd]    = useState('')
  const [confirmPwd,setConfirmPwd]= useState('')
  const [pwdMsg,    setPwdMsg]    = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newUsername,  setNewUsername]  = useState('')
  const [usernameMsg,  setUsernameMsg]  = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { setConfig(getAdminConfig()) }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveAdminConfig(config)
    // Also persist social links to Supabase so all devices/browsers can read them
    saveSocialLinksToSupabase(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY) ?? 'admin123'
    if (curPwd !== stored) {
      setPwdMsg({ type: 'error', text: 'Current password is incorrect.' })
      return
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPwd)
    setPwdMsg({ type: 'success', text: 'Password updated successfully.' })
    setCurPwd(''); setNewPwd(''); setConfirmPwd('')
    setTimeout(() => setPwdMsg(null), 3000)
  }

  function handleUsernameChange(e: React.FormEvent) {
    e.preventDefault()
    if (newUsername.trim().length < 3) {
      setUsernameMsg({ type: 'error', text: 'Username must be at least 3 characters.' })
      return
    }
    localStorage.setItem('slmh_admin_username', newUsername.trim())
    setUsernameMsg({ type: 'success', text: 'Username updated successfully.' })
    setNewUsername('')
    setTimeout(() => setUsernameMsg(null), 3000)
  }

  const tabs = [
    { key: 'general',      label: 'General',      icon: '⚙️' },
    { key: 'social',       label: 'Social',       icon: '🔗' },
    { key: 'content',      label: 'Content',      icon: '📄' },
    { key: 'seo',          label: 'SEO',          icon: '🔍' },
    { key: 'announcement', label: 'Banner',       icon: '📢' },
    { key: 'account',      label: 'Account',      icon: '🔐' },
  ] as const

  const MEMBER_COLORS = ['#1d4ed8','#15803d','#7c3aed','#c2410c','#0369a1','#92400e','#be185d','#065f46']
  const STAT_ICONS    = ['📝','👥','📜','🎓','🕌','📖','🏛️','🤝','⭐','🌍']

  function saveMember(member: TeamMember) {
    const exists = config.teamMembers.find((m) => m.id === member.id)
    const updated = exists
      ? config.teamMembers.map((m) => m.id === member.id ? member : m)
      : [...config.teamMembers, member]
    setConfig({ ...config, teamMembers: updated })
    setShowMemberForm(false)
    setEditingMember(null)
  }

  function removeMember(id: string) {
    setConfig({ ...config, teamMembers: config.teamMembers.filter((m) => m.id !== id) })
  }

  function updateStat(id: string, field: keyof Stat, value: string) {
    setConfig({
      ...config,
      stats: config.stats.map((s) => s.id === id ? { ...s, [field]: value } : s),
    })
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
  const focusStyle = { borderColor: '#4a9e1f', boxShadow: '0 0 0 3px rgba(74,158,31,0.1)' }

  return (
    <div className="space-y-6">

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
        style={{ background: 'white', border: '1px solid #e2e8f0' }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold flex-shrink-0 justify-center transition-all"
            style={{
              background: tab === t.key ? '#4a9e1f' : 'transparent',
              color:      tab === t.key ? 'white'    : '#64748b',
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── General tab ── */}
      {tab === 'general' && (
        <form onSubmit={handleSave}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>General Settings</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Update your site and profile information.</p>
            </div>

            <div className="p-6 space-y-5">

              {/* Maintenance mode */}
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: config.maintenanceMode ? '#fff1f2' : '#f0fdf4',
                  border: `1px solid ${config.maintenanceMode ? '#fca5a5' : '#bbf7d0'}`,
                }}
              >
                <div>
                  <p className="text-sm font-extrabold" style={{ color: config.maintenanceMode ? '#dc2626' : '#166534' }}>
                    {config.maintenanceMode ? '🔧 Site is in Maintenance Mode' : '✅ Site is Live'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: config.maintenanceMode ? '#ef4444' : '#4ade80', opacity: 0.9 }}>
                    {config.maintenanceMode
                      ? 'Visitors see the maintenance page. Admin panel is unaffected.'
                      : 'Visitors can browse the site normally.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                  className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300"
                  style={{ background: config.maintenanceMode ? '#dc2626' : '#4a9e1f' }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                    style={{ left: config.maintenanceMode ? '26px' : '2px' }}
                  />
                </button>
              </div>

              {/* Owner name */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                  Admin Display Name
                </label>
                <input
                  type="text"
                  value={config.ownerName}
                  onChange={(e) => setConfig({ ...config, ownerName: e.target.value })}
                  placeholder="Your name"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Shown in the sidebar and dashboard greeting.</p>
              </div>

              {/* Site name */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Site Name</label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Site Tagline</label>
                <textarea
                  rows={2}
                  value={config.tagline}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  className={inputClass} style={{ ...inputStyle, resize: 'none' }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, { ...inputStyle, ...focusStyle })}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { ...inputStyle, resize: 'none' })}
                />
              </div>

              {/* Contact info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Contact Email</label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className={inputClass} style={inputStyle}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Phone</label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className={inputClass} style={inputStyle}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Location</label>
                <input
                  type="text"
                  value={config.location}
                  onChange={(e) => setConfig({ ...config, location: e.target.value })}
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>
            </div>

            <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Save Changes
              </button>
              {saved && (
                <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#4a9e1f' }}>
                  ✅ Saved successfully
                </span>
              )}
            </div>
          </div>
        </form>
      )}

      {/* ── Social tab ── */}
      {tab === 'social' && (
        <form onSubmit={handleSave}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Social Media Links</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Add your social media profile URLs.</p>
            </div>
            <div className="p-6 space-y-5">
              {([
                {
                  key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage', color: '#1877f2',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>,
                },
                {
                  key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', color: '#dc2626',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
                },
                {
                  key: 'whatsapp', label: 'WhatsApp', placeholder: '+94 77 123 4567', color: '#25d366',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
                },
                {
                  key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/yourhandle', color: '#000000',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                },
                {
                  key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle', color: '#e1306c',
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
                },
              ] as { key: string; label: string; placeholder: string; color: string; icon: React.ReactNode }[]).map((s) => (
                <div key={s.key}>
                  <label className="flex items-center gap-2 text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: s.color }}
                    >
                      {s.icon}
                    </span>
                    {s.label}
                  </label>
                  <input
                    type="text"
                    value={config[s.key as keyof AdminConfig] as string}
                    onChange={(e) => setConfig({ ...config, [s.key]: e.target.value })}
                    placeholder={s.placeholder}
                    className={inputClass} style={inputStyle}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: '#4a9e1f' }}
              >
                Save Changes
              </button>
              {saved && <span className="text-sm font-semibold" style={{ color: '#4a9e1f' }}>✅ Saved successfully</span>}
            </div>
          </div>
        </form>
      )}

      {/* ── Content tab ── */}
      {tab === 'content' && (
        <div className="space-y-6">

          {/* Mission */}
          <form onSubmit={handleSave}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Our Mission</h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Shown in the About page mission section.</p>
              </div>
              <div className="p-6">
                <textarea
                  rows={6}
                  value={config.mission}
                  onChange={(e) => setConfig({ ...config, mission: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', resize: 'vertical', lineHeight: '1.8' }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' })}
                  placeholder="Describe the mission of SL Muslim History..."
                />
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Use blank lines to create separate paragraphs.</p>
              </div>
              <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f' }}>
                  Save Mission
                </button>
                {saved && <span className="text-sm font-semibold" style={{ color: '#4a9e1f' }}>✅ Saved successfully</span>}
              </div>
            </div>
          </form>

          {/* Stats */}
          <form onSubmit={handleSave}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>SL Muslim History in Numbers</h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>The 4 statistics shown in the About page banner.</p>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.stats.map((stat) => (
                  <div key={stat.id} className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex gap-1 flex-wrap">
                        {STAT_ICONS.map((ic) => (
                          <button
                            key={ic} type="button"
                            onClick={() => updateStat(stat.id, 'icon', ic)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-base transition-all"
                            style={{ background: stat.icon === ic ? '#f0fdf4' : 'white', border: `1px solid ${stat.icon === ic ? '#4a9e1f' : '#e2e8f0'}` }}
                          >{ic}</button>
                        ))}
                      </div>
                      <div className="text-3xl">{stat.icon}</div>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text" value={stat.value}
                        onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                        placeholder="175+"
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none font-bold"
                        style={{ border: '1px solid #e2e8f0', background: 'white', color: '#0f172a' }}
                      />
                      <input
                        type="text" value={stat.label}
                        onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                        placeholder="Articles Published"
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ border: '1px solid #e2e8f0', background: 'white', color: '#475569' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f' }}>
                  Save Numbers
                </button>
                {saved && <span className="text-sm font-semibold" style={{ color: '#4a9e1f' }}>✅ Saved successfully</span>}
              </div>
            </div>
          </form>

          {/* Team Members */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div>
                <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Our Team</h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Team members shown on the About page.</p>
              </div>
              <button
                onClick={() => { setEditingMember({ id: Date.now().toString(), name: '', role: '', bio: '', initials: '', color: '#1d4ed8' }); setShowMemberForm(true) }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: '#4a9e1f' }}
              >
                + Add Member
              </button>
            </div>

            {/* Inline member form */}
            {showMemberForm && editingMember && (
              <MemberForm
                member={editingMember}
                colors={MEMBER_COLORS}
                onSave={saveMember}
                onCancel={() => { setShowMemberForm(false); setEditingMember(null) }}
              />
            )}

            <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
              {config.teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ background: m.color }}>
                    {m.initials || m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#0f172a', fontFamily: "'Noto Sans Tamil', sans-serif" }}>{m.name}</p>
                    <p className="text-xs" style={{ color: '#4a9e1f' }}>{m.role}</p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#94a3b8' }}>{m.bio}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditingMember(m); setShowMemberForm(true) }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: '#f1f5f9', color: '#475569' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#4a9e1f'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
                    >Edit</button>
                    <button
                      onClick={() => removeMember(m.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: '#fef2f2', color: '#dc2626' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                    >Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => { saveAdminConfig(config); setSaved(true); setTimeout(() => setSaved(false), 2500) }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: '#4a9e1f' }}
              >
                Save Team
              </button>
              {saved && <span className="text-sm font-semibold ml-3" style={{ color: '#4a9e1f' }}>✅ Saved successfully</span>}
            </div>
          </div>

        </div>
      )}

      {/* ── SEO tab ── */}
      {tab === 'seo' && (
        <form onSubmit={handleSave}>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>SEO Settings</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Control how the site appears in search engines and social shares.</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Meta Description</label>
                <textarea
                  rows={3}
                  value={config.seo.metaDescription}
                  onChange={(e) => setConfig({ ...config, seo: { ...config.seo, metaDescription: e.target.value } })}
                  placeholder="A brief description of the site for search engines..."
                  className={inputClass}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { ...inputStyle, resize: 'none' })}
                />
                <p className="text-xs mt-1" style={{ color: config.seo.metaDescription.length > 160 ? '#dc2626' : '#94a3b8' }}>
                  {config.seo.metaDescription.length}/160 characters recommended
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>OG Image URL</label>
                <input
                  type="text"
                  value={config.seo.ogImage}
                  onChange={(e) => setConfig({ ...config, seo: { ...config.seo, ogImage: e.target.value } })}
                  placeholder="/og-image.jpg or https://..."
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  Image shown when sharing on WhatsApp, Facebook etc. Recommended: 1200×630px
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Google Analytics ID</label>
                <input
                  type="text"
                  value={config.seo.googleAnalyticsId}
                  onChange={(e) => setConfig({ ...config, seo: { ...config.seo, googleAnalyticsId: e.target.value } })}
                  placeholder="G-XXXXXXXXXX"
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>
            </div>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f' }}>
                Save SEO Settings
              </button>
              {saved && <span className="text-sm font-semibold" style={{ color: '#4a9e1f' }}>✅ Saved successfully</span>}
            </div>
          </div>
        </form>
      )}

      {/* ── Announcement tab ── */}
      {tab === 'announcement' && (
        <form onSubmit={handleSave}>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Announcement Banner</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Show a dismissible banner at the top of every page.</p>
            </div>
            <div className="p-6 space-y-5">

              {/* Enable toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0f172a' }}>Enable Banner</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Show the announcement banner on the public site</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, announcement: { ...config.announcement, enabled: !config.announcement.enabled } })}
                  className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                  style={{ background: config.announcement.enabled ? '#4a9e1f' : '#cbd5e1' }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: config.announcement.enabled ? '26px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: '#334155' }}>Banner Color</label>
                <div className="flex gap-3">
                  {([
                    { key: 'green', color: '#4a9e1f', label: 'Green'  },
                    { key: 'gold',  color: '#c9a84c', label: 'Gold'   },
                    { key: 'red',   color: '#dc2626', label: 'Red'    },
                    { key: 'blue',  color: '#1d4ed8', label: 'Blue'   },
                  ] as { key: 'green'|'gold'|'red'|'blue'; color: string; label: string }[]).map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setConfig({ ...config, announcement: { ...config.announcement, color: c.key } })}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className="w-8 h-8 rounded-full transition-all"
                        style={{
                          background: c.color,
                          border: `3px solid ${config.announcement.color === c.key ? '#0f172a' : 'transparent'}`,
                          transform: config.announcement.color === c.key ? 'scale(1.15)' : 'scale(1)',
                        }}
                      />
                      <span className="text-xs" style={{ color: '#64748b' }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>
                  Announcement Text <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={config.announcement.text}
                  onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, text: e.target.value } })}
                  placeholder="New article series on Mosque architecture launching this week!"
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Link (optional)</label>
                <input
                  type="text"
                  value={config.announcement.link}
                  onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, link: e.target.value } })}
                  placeholder="/articles/mosque-series or https://..."
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Makes the whole banner clickable</p>
              </div>

              {/* Preview */}
              {config.announcement.text && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: '#334155' }}>Preview</p>
                  <div
                    className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                    style={{ background: { green: '#4a9e1f', gold: '#c9a84c', red: '#dc2626', blue: '#1d4ed8' }[config.announcement.color] }}
                  >
                    <span className="text-sm font-semibold text-white">{config.announcement.text}</span>
                    {config.announcement.link && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                        Read more →
                      </span>
                    )}
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>✕</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f' }}>
                Save Banner
              </button>
              {saved && <span className="text-sm font-semibold" style={{ color: '#4a9e1f' }}>✅ Saved successfully</span>}
            </div>
          </div>
        </form>
      )}

      {/* ── Account tab ── */}
      {tab === 'account' && (
        <>
        {/* Change username */}
        <form onSubmit={handleUsernameChange}>
          <div
            className="rounded-2xl overflow-hidden mb-5"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Change Username</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Update your admin login username.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>New Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>
              {usernameMsg && (
                <p
                  className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg"
                  style={{
                    background: usernameMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color:      usernameMsg.type === 'success' ? '#15803d' : '#dc2626',
                  }}
                >
                  {usernameMsg.type === 'success' ? '✅' : '⚠️'} {usernameMsg.text}
                </p>
              )}
            </div>
            <div className="px-6 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#4a9e1f' }}>
                Update Username
              </button>
            </div>
          </div>
        </form>

        <form onSubmit={handlePasswordChange}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 className="font-extrabold text-sm" style={{ color: '#0f172a' }}>Change Password</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Update your admin login password.</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Current Password', value: curPwd, setter: setCurPwd },
                { label: 'New Password',     value: newPwd, setter: setNewPwd },
                { label: 'Confirm New Password', value: confirmPwd, setter: setConfirmPwd },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>{f.label}</label>
                  <input
                    type="password"
                    required
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    className={inputClass} style={inputStyle}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
              ))}
              {pwdMsg && (
                <p
                  className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg"
                  style={{
                    background: pwdMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color:      pwdMsg.type === 'success' ? '#15803d' : '#dc2626',
                  }}
                >
                  {pwdMsg.type === 'success' ? '✅' : '⚠️'} {pwdMsg.text}
                </p>
              )}
            </div>
            <div className="px-6 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: '#4a9e1f' }}
              >
                Update Password
              </button>
            </div>
          </div>
        </form>
        </>
      )}

    </div>
  )
}

// ── Inline team member form ──
function MemberForm({
  member, colors, onSave, onCancel,
}: {
  member: TeamMember
  colors: string[]
  onSave: (m: TeamMember) => void
  onCancel: () => void
}) {
  const [data, setData] = useState<TeamMember>(member)

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }

  return (
    <div className="p-6 space-y-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafffe' }}>
      {/* Color picker */}
      <div>
        <label className="block text-xs font-bold mb-2" style={{ color: '#334155' }}>Avatar Color</label>
        <div className="flex gap-2 flex-wrap items-center">
          {colors.map((c) => (
            <button
              key={c} type="button"
              onClick={() => setData({ ...data, color: c })}
              className="w-8 h-8 rounded-full transition-all"
              style={{ background: c, border: `3px solid ${data.color === c ? '#0f172a' : 'transparent'}`, transform: data.color === c ? 'scale(1.15)' : 'scale(1)' }}
            />
          ))}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white ml-2"
            style={{ background: data.color }}
          >
            {data.initials || '?'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Name (Tamil) *</label>
          <input
            type="text" required value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="டாக்டர் A. முஹம்மட்"
            className={inputClass} style={{ ...inputStyle, fontFamily: "'Noto Sans Tamil', sans-serif" }}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Initials *</label>
          <input
            type="text" required maxLength={3} value={data.initials}
            onChange={(e) => setData({ ...data, initials: e.target.value.toUpperCase() })}
            placeholder="AM"
            className={inputClass} style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Role *</label>
          <input
            type="text" required value={data.role}
            onChange={(e) => setData({ ...data, role: e.target.value })}
            placeholder="Chief Editor & Historian"
            className={inputClass} style={inputStyle}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#334155' }}>Bio</label>
          <textarea
            rows={2} value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            placeholder="Short biography..."
            className={inputClass} style={{ ...inputStyle, resize: 'none' }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { if (data.name && data.role) onSave(data) }}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: '#4a9e1f' }}
        >
          {member.name ? 'Update Member' : 'Add Member'}
        </button>
        <button
          type="button" onClick={onCancel}
          className="px-5 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#f1f5f9', color: '#64748b' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
