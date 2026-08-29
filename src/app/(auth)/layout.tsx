import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F2F4F8' }}>
      {/* Top hero with logo background */}
      <div
        className="relative flex flex-col items-center justify-center py-12 px-5"
        style={{
          background: 'linear-gradient(160deg, #EAF1FF 0%, #F3F8FF 50%, #E9F9F1 100%)',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        {/* Background logo — large, low opacity */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <Image
            src="/inochi-logo.jpeg"
            alt=""
            width={260}
            height={260}
            className="object-contain"
            style={{ opacity: 0.07 }}
            priority
          />
        </div>

        {/* Foreground: logo + name */}
        <div className="relative flex flex-col items-center gap-3 z-10">
          <Image
            src="/inochi-logo.jpeg"
            alt="Inochi logo"
            width={80}
            height={80}
            className="object-contain rounded-2xl"
            style={{ background: '#FFFFFF', padding: 8, boxShadow: '0 4px 20px rgba(47,107,255,0.15)' }}
            priority
          />
          <p style={{ fontSize: 26, fontWeight: 800, color: '#12151C', letterSpacing: '-0.02em' }}>INOCHI</p>
          <p style={{ fontSize: 13, color: '#8A93A3', fontWeight: 500, textAlign: 'center' }}>Your Health. Your Data. Your Control.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
