import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#F2F4F8' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#EEF1F6' }}>
        <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="#8A93A3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#12151C' }}>Page not found</h1>
      <p className="text-sm mb-8" style={{ color: '#8A93A3' }}>The page you are looking for does not exist.</p>
      <Link
        href="/patient/records"
        className="font-semibold text-sm px-6 py-3 rounded-2xl tap-target"
        style={{ background: '#2F6BFF', color: '#FFFFFF' }}
      >
        Go to Health Wallet
      </Link>
    </div>
  );
}
