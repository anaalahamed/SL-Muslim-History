'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AnimateIn from '@/components/ui/AnimateIn'
import PageHero from '@/components/ui/PageHero'
import { getAdminConfig, defaultConfig, AdminConfig } from '@/lib/adminConfig'
import { saveMessage } from '@/lib/db/contact'

const faqs = [
  {
    q: 'How can I submit an article?',
    a: 'Use the contact form above, select "Submit an Article" as the reason, and briefly describe your topic. Our editorial team will review and get back to you with submission guidelines.',
  },
  {
    q: 'Can I share old family photographs?',
    a: 'Yes! Historical photographs are invaluable to us. Select "Share Historical Photos" and we will guide you through the donation or archiving process.',
  },
  {
    q: 'Is the content free to read?',
    a: 'All content on SL Muslim History is completely free. We believe history should be accessible to everyone in the community.',
  },
  {
    q: 'How do I report an error in an article?',
    a: 'Select "Report an Error" in the contact form and include the article title and what you believe is incorrect. We take accuracy seriously and will review promptly.',
  },
  {
    q: 'Can organisations partner with you?',
    a: 'We welcome partnerships with universities, cultural organisations, and community groups. Select "Partnership / Collaboration" and tell us about your organisation.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'white' }}
    >
      <div
        className="px-6 py-4"
        style={{ background: 'var(--green-light)', borderBottom: '1px solid var(--border)' }}
      >
        <h3 className="font-extrabold text-base flex items-center gap-2" style={{ color: 'var(--dark)' }}>
          <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
          Frequently Asked Questions
        </h3>
      </div>
      <div>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left transition-all"
              style={{ background: open === i ? 'var(--green-light)' : 'transparent' }}
            >
              <span className="text-sm font-semibold pr-4" style={{ color: 'var(--dark)' }}>{faq.q}</span>
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-transform"
                style={{
                  background: open === i ? 'var(--green)' : 'var(--bg)',
                  color: open === i ? 'white' : 'var(--muted)',
                  transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease, background 0.2s',
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div className="px-6 pb-4">
                <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: '1.8' }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const contactInfo = [
  {
    icon: '📧',
    label: 'Email',
    value: 'info@srilankamuslimhistory.com',
    sub: 'We reply within 2 business days',
    color: '#1d4ed8',
    bg: '#dbeafe',
  },
  {
    icon: '📍',
    label: 'Location',
    value: 'Colombo, Sri Lanka',
    sub: 'Research & editorial office',
    color: '#15803d',
    bg: '#dcfce7',
  },
  {
    icon: '📞',
    label: 'Phone',
    value: '+94 11 234 5678',
    sub: 'Mon – Fri, 9 AM – 5 PM',
    color: '#a16207',
    bg: '#fef9c3',
  },
]

const socialIcons = {
  facebook:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" /></svg>,
  youtube:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  whatsapp:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
  twitter:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>,
}

const reasons = [
  { icon: '✍️', label: 'Submit an Article' },
  { icon: '🔍', label: 'Research Inquiry' },
  { icon: '🤝', label: 'Partnership / Collaboration' },
  { icon: '📸', label: 'Share Historical Photos' },
  { icon: '🐛', label: 'Report an Error' },
  { icon: '💬', label: 'General Enquiry' },
]

type FormState = 'idle' | 'sending' | 'sent'

export default function ContactPage() {
  const [form,   setForm]   = useState({ name: '', email: '', reason: '', message: '' })
  const [status, setStatus] = useState<FormState>('idle')
  const [config, setConfig] = useState<AdminConfig>(defaultConfig)
  useEffect(() => { setConfig(getAdminConfig()) }, [])

  // Build contact info from adminConfig
  const contactInfo = [
    { icon: '📧', label: 'Email',    value: config.email,    sub: 'We reply within 2 business days', color: '#1d4ed8', bg: '#dbeafe' },
    { icon: '📞', label: 'Phone',    value: config.phone,    sub: 'Mon – Fri, 9 AM – 5 PM',          color: '#15803d', bg: '#dcfce7' },
    { icon: '📍', label: 'Location', value: config.location, sub: 'Mon – Fri, 9 AM – 5 PM',          color: '#a16207', bg: '#fef9c3' },
  ].filter((c) => c.value)

  // Only show social links that have a URL set
  const activeSocials = [
    { label: 'Facebook',   href: config.facebook,   color: '#1877f2', icon: socialIcons.facebook  },
    { label: 'YouTube',    href: config.youtube,    color: '#dc2626', icon: socialIcons.youtube   },
    { label: 'WhatsApp',   href: config.whatsapp,   color: '#25d366', icon: socialIcons.whatsapp  },
    { label: 'Twitter / X',href: config.twitter,    color: '#000000', icon: socialIcons.twitter   },
    { label: 'Instagram',  href: config.instagram,  color: '#e1306c', icon: socialIcons.instagram },
  ].filter((s) => !!s.href)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setTimeout(() => {
      saveMessage({ name: form.name, email: form.email, reason: form.reason, message: form.message })
      setStatus('sent')
    }, 600)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <PageHero
        badge="Contact Us"
        title="Get in Touch"
        subtitle="Have a question, want to contribute, or share a piece of history? We'd love to hear from you."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Contact form */}
          <div className="flex-1 min-w-0">
            <AnimateIn direction="up">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'white' }}
              >
                <div
                  className="px-8 py-6"
                  style={{ background: 'var(--green-light)', borderBottom: '1px solid var(--border)' }}
                >
                  <h2 className="text-xl font-extrabold" style={{ color: 'var(--dark)' }}>Send us a Message</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Fill in the form below and we&apos;ll get back to you shortly.</p>
                </div>

                {status === 'sent' ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-5">✅</div>
                    <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--dark)' }}>Message Sent!</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                      Thank you for reaching out. We&apos;ll reply to <strong>{form.email}</strong> within 2 business days.
                    </p>
                    <button
                      onClick={() => { setForm({ name: '', email: '', reason: '', message: '' }); setStatus('idle') }}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm"
                      style={{ background: 'var(--green)', color: 'white' }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-8 space-y-5">

                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--dark)' }}>
                          Your Name <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Mohamed Ali"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.12)' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--dark)' }}>
                          Email Address <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.12)' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-xs font-bold mb-2" style={{ color: 'var(--dark)' }}>
                        Reason for Contact
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {reasons.map((r) => (
                          <button
                            key={r.label}
                            type="button"
                            onClick={() => setForm({ ...form, reason: r.label })}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all"
                            style={{
                              border: `1px solid ${form.reason === r.label ? 'var(--green)' : 'var(--border)'}`,
                              background: form.reason === r.label ? 'var(--green-light)' : 'var(--bg)',
                              color: form.reason === r.label ? 'var(--green)' : 'var(--muted)',
                            }}
                          >
                            <span>{r.icon}</span>
                            <span className="line-clamp-1">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--dark)' }}>
                        Message <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Write your message here..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                        style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,158,31,0.12)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: status === 'sending' ? 'var(--muted)' : 'var(--green)',
                        color: 'white',
                        boxShadow: status === 'sending' ? 'none' : '0 4px 14px rgba(74,158,31,0.3)',
                        cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {status === 'sending' ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send Message →'
                      )}
                    </button>

                  </form>
                )}
              </div>
            </AnimateIn>

            {/* What happens next */}
            <AnimateIn direction="up" delay={100}>
              <div
                className="rounded-2xl p-6"
                style={{ border: '1px solid var(--border)', background: 'white' }}
              >
                <h3 className="font-extrabold text-base mb-5 flex items-center gap-2" style={{ color: 'var(--dark)' }}>
                  <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--green)' }} />
                  What Happens Next?
                </h3>
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-0">
                  {[
                    { step: '1', icon: '📨', title: 'We Receive It', desc: 'Your message lands in our inbox immediately.' },
                    { step: '2', icon: '👀', title: 'We Review It', desc: 'Our team reads and assigns it to the right person.' },
                    { step: '3', icon: '💬', title: 'We Reply', desc: 'You get a response within 2 business days.' },
                  ].map((item, i) => (
                    <div key={item.step} className="flex sm:flex-col flex-1 items-start sm:items-center sm:text-center gap-4 sm:gap-2 relative">
                      {/* Connector line between steps */}
                      {i < 2 && (
                        <div
                          className="hidden sm:block absolute top-5 left-1/2 w-full h-0.5"
                          style={{ background: 'var(--border)', zIndex: 0 }}
                        />
                      )}
                      <div
                        className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'var(--green-light)', border: '2px solid var(--green)' }}
                      >
                        {item.icon}
                      </div>
                      <div className="sm:px-2">
                        <div className="text-xs font-black mb-0.5" style={{ color: 'var(--dark)' }}>{item.title}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)', lineHeight: '1.6' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>

            {/* FAQ */}
            <AnimateIn direction="up" delay={150}>
              <FAQ />
            </AnimateIn>

          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="space-y-6 lg:sticky lg:top-6">

              {/* Contact info cards */}
              <AnimateIn direction="right" delay={100}>
                <div
                  className="rounded-2xl p-5 space-y-4"
                  style={{ border: '1px solid var(--border)', background: 'white' }}
                >
                  <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--dark)' }}>
                    <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--green)' }} />
                    Contact Information
                  </h3>
                  {contactInfo.map((info) => (
                    <div
                      key={info.label}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: info.bg }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: 'white' }}
                      >
                        {info.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black mb-0.5" style={{ color: info.color }}>{info.label}</div>
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--dark)' }}>{info.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateIn>

              {/* Social links */}
              <AnimateIn direction="right" delay={200}>
                <div
                  className="rounded-2xl p-5"
                  style={{ border: '1px solid var(--border)', background: 'white' }}
                >
                  <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--dark)' }}>
                    <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
                    Follow Us
                  </h3>
                  <div className="space-y-2">
                    {activeSocials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl transition-all"
                        style={{ border: '1px solid var(--border)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = s.color
                          e.currentTarget.style.borderColor = s.color
                          e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = ''
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                          style={{ background: s.color }}
                        >
                          {s.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: 'var(--dark)' }}>{s.label}</div>
                          <div className="text-xs" style={{ color: 'var(--muted)' }}>{s.href}</div>
                        </div>
                      </a>
                    ))}
                    {activeSocials.length === 0 && (
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>No social links configured yet.</p>
                    )}
                  </div>
                </div>
              </AnimateIn>

              {/* Map placeholder */}
              <AnimateIn direction="right" delay={300}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div
                    className="h-44 flex flex-col items-center justify-center gap-2"
                    style={{ background: 'var(--green-light)' }}
                  >
                    <span className="text-4xl">🗺️</span>
                    {config.location && (
                      <span className="text-sm font-semibold" style={{ color: 'var(--green-dark)' }}>{config.location}</span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Interactive map will be added soon</span>
                  </div>
                </div>
              </AnimateIn>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
