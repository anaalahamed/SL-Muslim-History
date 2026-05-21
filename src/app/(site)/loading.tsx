export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#0d2e1b' }}
    >
      {/* Gold top bar */}
      <div className="fixed top-0 left-0 h-0.5 loading-bar" style={{ background: 'linear-gradient(to right, #c9a84c, #f0d080)', zIndex: 10000 }} />

      {/* Logo mark */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <div
            className="absolute w-24 h-24 rounded-full opacity-20"
            style={{
              border: '1px solid #c9a84c',
              animation: 'pulseRing 2s ease-out infinite',
            }}
          />
          {/* Inner ring */}
          <div
            className="absolute w-16 h-16 rounded-full opacity-30"
            style={{
              border: '1px solid #c9a84c',
              animation: 'pulseRing 2s ease-out 0.4s infinite',
            }}
          />
          {/* Logo */}
          <img
            src="/logo.png"
            alt="SL Muslim History"
            className="relative"
            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
          />
        </div>

        {/* Site name */}
        <div className="text-center">
          <p className="text-base font-black tracking-widest uppercase" style={{ color: '#c9a84c', letterSpacing: '0.2em' }}>
            SL Muslim History
          </p>
          <p className="text-xs mt-1 tracking-wider" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>
            Preserving Heritage
          </p>
        </div>

        {/* Dot loader */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#c9a84c',
                animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(0.9); opacity: 0.3; }
          50%  { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(0.9); opacity: 0.3; }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1);   opacity: 0.4; }
          50%       { transform: scale(1.5); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
