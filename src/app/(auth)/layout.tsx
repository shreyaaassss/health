export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: 'var(--page)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#2F6BFF' }}>
            <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>Health Wallet</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Your Health. Your Data. Your Control.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
