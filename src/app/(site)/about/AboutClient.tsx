'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import AnimateIn from '@/components/ui/AnimateIn'
import PageHero from '@/components/ui/PageHero'
import { getAdminConfig, defaultConfig, AdminConfig } from '@/lib/adminConfig'

const milestones = [
  { year: '2010', event: 'SL Muslim History founded as a small research blog' },
  { year: '2013', event: 'First printed booklet on Beruwala mosque history published' },
  { year: '2016', event: 'Partnership with University of Colombo history department' },
  { year: '2019', event: 'Reached 50,000 monthly readers across Sri Lanka and diaspora' },
  { year: '2022', event: 'Digital archive of 500+ historical photographs launched' },
  { year: '2026', event: 'New website launched with full Tamil content and modern design' },
]

const values = [
  { icon: '📜', title: 'Historical Accuracy', desc: 'Every article is researched from primary sources, manuscripts, and verified academic references.' },
  { icon: '🤝', title: 'Community First', desc: 'We serve the Sri Lankan Muslim community and preserve their heritage for future generations.' },
  { icon: '🌍', title: 'Open Access', desc: 'All content is free and accessible to everyone — locally and across the global diaspora.' },
  { icon: '📖', title: 'Tamil Literacy', desc: 'We publish in Tamil to preserve the language and make history accessible to native readers.' },
]

export default function AboutClient() {
  const [config, setConfig] = useState<AdminConfig>(defaultConfig)
  useEffect(() => { setConfig(getAdminConfig()) }, [])

  const team       = config.teamMembers
  const stats      = config.stats
  const missionParagraphs = config.mission.split('\n\n').map((p) => p.trim()).filter(Boolean)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <PageHero
        badge="About Us"
        title="Preserving 1,400 Years of Sri Lanka Muslim History"
        subtitle="A dedicated platform for researching, documenting, and sharing the rich heritage of Sri Lanka's Muslim community — from the first Arab traders to the vibrant community of today."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* Mission */}
        <AnimateIn direction="up">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 rounded-full" style={{ background: 'var(--green)' }} />
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--dark)' }}>Our Mission</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {missionParagraphs.map((p, i) => (
                  <p key={i} style={{ color: 'var(--text)', lineHeight: '1.9' }}>{p}</p>
                ))}
              </div>
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: 'var(--green-light)', border: '1px solid var(--border)' }}
              >
                <div className="mb-4 animate-float" style={{ display: 'inline-block' }}>
                  <Image src="/logo.png" alt="SL Muslim History" width={120} height={52} className="object-contain" />
                </div>
                <blockquote
                  className="tamil-text text-base italic"
                  style={{ color: 'var(--green-dark)', lineHeight: '1.9' }}
                >
                  &ldquo;History is the witness that testifies to the passing of time. It illuminates reality,
                  vitalizes memory, and provides guidance in daily life.&rdquo;
                </blockquote>
                <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--muted)' }}>— Cicero</p>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Values */}
        <AnimateIn direction="up">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 rounded-full" style={{ background: 'var(--gold)' }} />
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--dark)' }}>What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((v, i) => (
                <AnimateIn key={v.title} direction="up" delay={i * 80}>
                  <div
                    className="rounded-2xl p-6 h-full"
                    style={{ border: '1px solid var(--border)', background: 'white' }}
                  >
                    <div className="text-4xl mb-4">{v.icon}</div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color: 'var(--dark)' }}>{v.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: '1.7' }}>{v.desc}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Timeline */}
        <AnimateIn direction="up">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 rounded-full" style={{ background: 'var(--green)' }} />
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--dark)' }}>Our Journey</h2>
            </div>
            <div className="max-w-3xl">
              <div className="relative">
                <div className="absolute left-16 top-0 bottom-0 w-0.5" style={{ background: 'var(--border)' }} />
                <div className="space-y-6">
                  {milestones.map((m, i) => (
                    <AnimateIn key={m.year} direction="left" delay={i * 80}>
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-16 text-right">
                          <span
                            className="text-xs font-black px-2 py-1 rounded-lg"
                            style={{
                              background: i === milestones.length - 1 ? 'var(--green)' : 'var(--green-light)',
                              color: i === milestones.length - 1 ? 'white' : 'var(--green)',
                            }}
                          >
                            {m.year}
                          </span>
                        </div>
                        <div
                          className="flex-shrink-0 w-3 h-3 rounded-full mt-1.5 relative z-10"
                          style={{
                            background: i === milestones.length - 1 ? 'var(--green)' : 'var(--border)',
                            border: '2px solid white',
                            boxShadow: '0 0 0 2px var(--border)',
                          }}
                        />
                        <p
                          className="text-sm pb-4"
                          style={{
                            color: i === milestones.length - 1 ? 'var(--dark)' : 'var(--muted)',
                            fontWeight: i === milestones.length - 1 ? 600 : 400,
                            lineHeight: '1.7',
                          }}
                        >
                          {m.event}
                        </p>
                      </div>
                    </AnimateIn>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Team */}
        <AnimateIn direction="up">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 rounded-full" style={{ background: 'var(--gold)' }} />
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--dark)' }}>Our Team</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <AnimateIn key={member.name} direction="up" delay={i * 80}>
                  <div
                    className="rounded-2xl p-6 text-center h-full"
                    style={{ border: '1px solid var(--border)', background: 'white' }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white mx-auto mb-4"
                      style={{ background: member.color }}
                    >
                      {member.initials || member.name.charAt(0)}
                    </div>
                    <h3 className="tamil-heading font-extrabold text-sm mb-1" style={{ color: 'var(--dark)' }}>
                      {member.name}
                    </h3>
                    <p className="text-xs font-bold mb-3 px-3 py-1 rounded-full inline-block" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                      {member.role}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
                      {member.bio}
                    </p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Stats */}
        <AnimateIn direction="up">
          <div
            className="rounded-2xl p-8"
            style={{ background: 'linear-gradient(135deg, var(--green-dark) 0%, #1a4a2e 100%)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-center text-2xl font-extrabold text-white mb-8">SL Muslim History in Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-black mb-1" style={{ color: 'var(--gold)' }}>{stat.value}</div>
                  <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* CTA */}
        <AnimateIn direction="up">
          <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <div className="text-5xl mb-4">🤝</div>
            <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--dark)' }}>Want to Contribute?</h2>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--muted)', lineHeight: '1.8' }}>
              Are you a historian, researcher, or community member with stories to share?
              We welcome contributions from passionate individuals who care about preserving our heritage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
                style={{ background: 'var(--green)', color: 'white', boxShadow: '0 4px 14px rgba(74,158,31,0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(74,158,31,0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(74,158,31,0.3)' }}
              >
                Get in Touch →
              </Link>
              <Link
                href="/articles"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
                style={{ background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--border)', transition: 'transform 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Browse Articles
              </Link>
            </div>
          </div>
        </AnimateIn>

      </div>
    </div>
  )
}
