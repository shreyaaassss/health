// Visible watermark on provider record view — traceable if screenshot is taken
export function ConfidentialWatermark({ doctorName }: { doctorName: string }) {
  const ts = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
  return (
    <div
      className="rounded-xl px-3 py-2 flex items-center gap-2 mb-4"
      style={{ background: '#FEF6E7', border: '1px solid #E5A02030' }}
    >
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#E5A020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11Z"/>
      </svg>
      <p style={{ fontSize: 11, color: '#E5A020', fontWeight: 600 }}>
        CONFIDENTIAL · Viewed by {doctorName} · {ts} · Unauthorised reproduction prohibited
      </p>
    </div>
  );
}
