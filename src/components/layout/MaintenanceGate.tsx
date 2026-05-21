'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getAdminConfig } from '@/lib/adminConfig'

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false)
  const [checked,     setChecked]     = useState(false)

  useEffect(() => {
    setMaintenance(getAdminConfig().maintenanceMode)
    setChecked(true)
  }, [])

  // Don't flash anything until we've checked localStorage
  if (!checked) return null

  if (!maintenance) return <>{children}</>

  return <MaintenancePage />
}

function MaintenancePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d2e1b 0%, #152d1a 60%, #0a2213 100%)' }}
    >
      {/* Radial glows */}
      <div className="absolute pointer-events-none" style={{ top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(74,158,31,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-80px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Gold top border */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #f0d060 50%, #c9a84c 70%, transparent)' }} />

      <div className="relative z-10 text-center max-w-lg">

        {/* Logo */}
        <div className="inline-block rounded-2xl overflow-hidden mb-8" style={{ background: 'white', padding: '12px 20px' }}>
          <Image src="/logo.png" alt="SL Muslim History" width={140} height={60} className="object-contain" style={{ height: '56px', width: 'auto' }} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-white mb-3">
          Under Maintenance
        </h1>
        <div className="w-16 h-0.5 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

        {/* Message */}
        <p className="text-base mb-2" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.8' }}>
          We&apos;re currently performing scheduled maintenance to improve your experience.
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.7' }}>
          SL Muslim History will be back shortly. Thank you for your patience.
        </p>

        {/* Decorative dots loader */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#c9a84c',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Contact note */}
        <p className="text-xs mt-10" style={{ color: 'rgba(255,255,255,0.25)' }}>
          For urgent inquiries, contact us at{' '}
          <a
            href="mailto:info@srilankamuslimhistory.com"
            className="underline transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a84c' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
          >
            info@srilankamuslimhistory.com
          </a>
        </p>
      </div>

      {/* Gold bottom border */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #f0d060 50%, #c9a84c 70%, transparent)' }} />

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
