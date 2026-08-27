type ErrorCode = 'ACCESS_REVOKED' | 'ACCESS_EXPIRED' | 'TOKEN_INVALID' | 'ACCESS_DENIED';

const ERROR_CONFIG: Record<ErrorCode, {
  svgPath: React.ReactNode;
  title: string;
  message: string;
  bg: string;
  iconBg: string;
  iconStroke: string;
  textColor: string;
}> = {
  ACCESS_REVOKED: {
    svgPath: (
      <>
        <circle cx="12" cy="12" r="9"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </>
    ),
    title: 'Access Revoked',
    message: 'The patient has revoked access to these medical records. You no longer have permission to view them.',
    bg: '#FFEDED',
    iconBg: '#FFEDED',
    iconStroke: '#C23B3B',
    textColor: '#C23B3B',
  },
  ACCESS_EXPIRED: {
    svgPath: (
      <>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
      </>
    ),
    title: 'Access Expired',
    message: 'The access period for these medical records has ended. Please ask the patient to generate a new access link.',
    bg: '#FEF6E7',
    iconBg: '#FEF6E7',
    iconStroke: '#E5A020',
    textColor: '#E5A020',
  },
  TOKEN_INVALID: {
    svgPath: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </>
    ),
    title: 'Invalid Access Link',
    message: 'This access link is not valid. It may have been entered incorrectly. Please ask the patient to share the access link again.',
    bg: '#F3F8FF',
    iconBg: '#EAF1FF',
    iconStroke: '#2F6BFF',
    textColor: '#1D4FE0',
  },
  ACCESS_DENIED: {
    svgPath: (
      <>
        <circle cx="12" cy="12" r="9"/>
        <path d="M4.93 4.93l14.14 14.14"/>
      </>
    ),
    title: 'Access Denied',
    message: 'You do not have permission to access this record.',
    bg: '#F3F8FF',
    iconBg: '#EEF1F6',
    iconStroke: '#8A93A3',
    textColor: '#4B5265',
  },
};

export function AccessErrorScreen({ code }: { code: ErrorCode }) {
  const config = ERROR_CONFIG[code] ?? ERROR_CONFIG.TOKEN_INVALID;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: config.bg }}>
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: config.iconBg, border: `2px solid ${config.iconStroke}30` }}
        >
          <svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke={config.iconStroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {config.svgPath}
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-3" style={{ color: config.textColor }}>{config.title}</h1>

        {/* Message */}
        <p className="text-sm leading-relaxed mb-8" style={{ color: '#4B5265' }}>{config.message}</p>

        {/* Visual separator */}
        <div className="border-t pt-6" style={{ borderColor: '#EEF1F6' }}>
          <p className="text-xs" style={{ color: '#8A93A3' }}>Health Wallet · Patient-Controlled Access</p>
        </div>
      </div>
    </div>
  );
}
