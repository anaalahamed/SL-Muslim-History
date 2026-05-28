'use client'

import { useState } from 'react'
import Link from 'next/link'

const AMOUNTS = [500, 1000, 2500, 5000]

const BANKS = [
  { name: 'Bank of Ceylon',  accountName: 'SL Muslim History Foundation', accountNo: 'XXXX XXXX XXXX', branch: 'Colombo Main Branch', swift: 'BCEYLKLX' },
  { name: "People's Bank",   accountName: 'SL Muslim History Foundation', accountNo: 'XXXX XXXX XXXX', branch: 'Colombo 03',          swift: 'PEBLLKLX' },
]

export default function DonateClient() {
  const [selected, setSelected] = useState<number | null>(1000)
  const [custom, setCustom]     = useState('')
  const [copied, setCopied]     = useState<string | null>(null)

  function handleCustomChange(val: string) {
    const n = val.replace(/[^0-9]/g, '')
    setCustom(n)
    setSelected(null)
  }

  function selectPreset(amt: number) {
    setSelected(amt)
    setCustom('')
  }

  const displayAmount = selected !== null ? selected : (parseInt(custom) || 0)

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d3b1a 0%, #1a5c2a 50%, #0d3b1a 100%)', padding: '80px 24px 100px' }}>
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--gold)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-5" style={{ background: '#4a9e1f', filter: 'blur(40px)' }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <span>♥</span> Support our mission
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: 'white' }}>
            Help Preserve<br />
            <span style={{ color: 'var(--gold)' }}>Sri Lanka&apos;s Muslim Heritage</span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            For over 1,400 years, Muslims have been an integral part of Sri Lanka&apos;s history, culture, and society.
            Your donation helps us research, document, and share this rich heritage with future generations.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: '📚', label: '500+ Articles Archived' },
              { icon: '🕌', label: '200+ Historic Sites Documented' },
              { icon: '👥', label: '10,000+ Monthly Readers' },
            ].map((stat) => (
              <span key={stat.label} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}>
                {stat.icon} {stat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Wave */}
      <div style={{ marginTop: '-2px', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#f8fafc"/>
        </svg>
      </div>

      {/* Main */}
      <section style={{ background: '#f8fafc', padding: '0 24px 80px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-4 rounded-2xl p-5 mb-10" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <span className="text-2xl flex-shrink-0">🔔</span>
            <div>
              <p className="font-bold text-sm mb-1" style={{ color: '#92400e' }}>Online Payments Coming Soon</p>
              <p className="text-sm" style={{ color: '#b45309' }}>
                We are currently processing the required approvals and legal registrations to accept online payments.
                In the meantime, you can support us via direct bank transfer using the details below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* Amount selector */}
              <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h2 className="font-extrabold text-base mb-1" style={{ color: '#0f172a' }}>Choose an Amount</h2>
                <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>All amounts in Sri Lankan Rupees (LKR)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  {AMOUNTS.map((amt) => (
                    <button key={amt} type="button" onClick={() => selectPreset(amt)} className="py-3 rounded-xl text-sm font-bold transition-all" style={{ background: selected === amt ? '#4a9e1f' : '#f8fafc', color: selected === amt ? 'white' : '#475569', border: selected === amt ? '2px solid #3d8a18' : '2px solid #e2e8f0', boxShadow: selected === amt ? '0 4px 12px rgba(74,158,31,0.25)' : 'none' }}>
                      LKR {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ border: `2px solid ${selected === null && custom ? '#4a9e1f' : '#e2e8f0'}`, background: '#f8fafc' }}>
                  <span className="font-bold text-sm flex-shrink-0" style={{ color: '#94a3b8' }}>LKR</span>
                  <input type="text" inputMode="numeric" placeholder="Enter custom amount" value={custom} onChange={(e) => handleCustomChange(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-semibold" style={{ color: '#1e293b' }} onFocus={() => { setSelected(null) }} />
                </div>
                {displayAmount > 0 && <p className="text-xs mt-3 font-semibold" style={{ color: '#4a9e1f' }}>✓ You will donate LKR {displayAmount.toLocaleString()}</p>}
              </div>

              {/* Payment methods */}
              <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h2 className="font-extrabold text-base mb-4" style={{ color: '#0f172a' }}>Payment Methods</h2>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🏦</span>
                    <span className="font-bold text-sm" style={{ color: '#0f172a' }}>Direct Bank Transfer</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#15803d' }}>Available Now</span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: '#64748b' }}>Transfer directly to our bank account and send the receipt to <a href="mailto:donate@slmuslimhistory.lk" style={{ color: '#4a9e1f', fontWeight: 600 }}>donate@slmuslimhistory.lk</a></p>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />
                {[{ icon: '💳', label: 'PayPal / Credit Card' }, { icon: '📱', label: 'PayHere (Sri Lanka)' }].map((m) => (
                  <div key={m.label} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{m.icon}</span>
                      <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{m.label}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#a16207' }}>Coming Soon</span>
                    </div>
                    <button disabled className="w-full py-3 rounded-xl text-sm font-bold cursor-not-allowed" style={{ background: '#e2e8f0', color: '#94a3b8' }}>Donate via {m.label} — Coming Soon</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Bank details */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#0f172a' }}>
                  <span className="text-base">🏦</span>
                  <span className="text-sm font-extrabold text-white">Bank Transfer Details</span>
                </div>
                {BANKS.map((bank, i) => (
                  <div key={bank.name} className="px-5 py-4" style={{ background: 'white', borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                    <p className="text-xs font-extrabold mb-2.5" style={{ color: '#4a9e1f' }}>{bank.name}</p>
                    {[
                      { label: 'Account Name', value: bank.accountName, key: `name-${i}` },
                      { label: 'Account No.',  value: bank.accountNo,   key: `no-${i}` },
                      { label: 'Branch',       value: bank.branch,      key: `br-${i}` },
                      { label: 'SWIFT Code',   value: bank.swift,       key: `sw-${i}` },
                    ].map(({ label, value, key }) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color: '#1e293b' }}>{value}</span>
                          <button type="button" onClick={() => copyText(value, key)} className="text-xs px-1.5 py-0.5 rounded transition-all" style={{ background: copied === key ? '#dcfce7' : '#f1f5f9', color: copied === key ? '#15803d' : '#64748b' }}>
                            {copied === key ? '✓' : '⧉'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="px-5 py-3" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <p className="text-xs" style={{ color: '#64748b' }}>After transferring, email your receipt to <a href="mailto:donate@slmuslimhistory.lk" style={{ color: '#4a9e1f', fontWeight: 600 }}>donate@slmuslimhistory.lk</a> with your name and amount.</p>
                </div>
              </div>

              {/* Impact */}
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h3 className="font-extrabold text-sm mb-4" style={{ color: '#0f172a' }}>Your Impact</h3>
                <div className="space-y-3">
                  {[
                    { amount: 'LKR 500',   icon: '✍️', desc: 'Funds research for one article' },
                    { amount: 'LKR 1,000', icon: '📸', desc: 'Covers photography of a historic site' },
                    { amount: 'LKR 2,500', icon: '📖', desc: 'Supports one month of server costs' },
                    { amount: 'LKR 5,000', icon: '🏛️', desc: 'Enables a full field-research trip' },
                  ].map((item) => (
                    <div key={item.amount} className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--green-light)' }}>{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: '#0f172a' }}>{item.amount}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
                <p className="text-sm font-bold mb-1" style={{ color: '#15803d' }}>Have questions?</p>
                <p className="text-xs mb-3" style={{ color: '#166534' }}>We&apos;re happy to answer any questions about donations.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: '#4a9e1f', boxShadow: '0 2px 8px rgba(74,158,31,0.3)' }}>
                  Contact Us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
