import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'transparent' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* INOCHI logo — no container, no box, mix-blend-mode removes white bg */}
        <div className="mb-2 flex flex-col items-center">
          <Image
            src="/inochi-logo.jpeg"
            alt="Inochi"
            width={160}
            height={160}
            className="object-contain"
            style={{ mixBlendMode: 'multiply' }}
            priority
          />
          {/* Tagline only — no text "INOCHI", the logo already has it */}
          <p
            style={{
              fontSize: 13,
              color: '#8A93A3',
              fontWeight: 500,
              textAlign: 'center',
              marginTop: 4,
              letterSpacing: '0.01em',
            }}
          >
            Your Health. Your Data. Your Control.
          </p>
        </div>

        {/* Login / Register card */}
        <div className="w-full mt-6">
          {children}
        </div>

      </div>
    </div>
  );
}
