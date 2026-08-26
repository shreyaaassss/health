type ErrorCode = 'ACCESS_REVOKED' | 'ACCESS_EXPIRED' | 'TOKEN_INVALID' | 'ACCESS_DENIED';

const ERROR_CONFIG: Record<ErrorCode, {
  icon: string;
  title: string;
  message: string;
  bg: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
}> = {
  ACCESS_REVOKED: {
    icon: '🚫',
    title: 'Access Revoked',
    message: 'The patient has revoked access to these medical records. You no longer have permission to view them.',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
  },
  ACCESS_EXPIRED: {
    icon: '⏱️',
    title: 'Access Expired',
    message: 'The access period for these medical records has ended. Please ask the patient to generate a new access link.',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-800',
  },
  TOKEN_INVALID: {
    icon: '🔒',
    title: 'Invalid Access Link',
    message: 'This access link is not valid. It may have been entered incorrectly. Please ask the patient to share the access link again.',
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    textColor: 'text-slate-800',
  },
  ACCESS_DENIED: {
    icon: '⛔',
    title: 'Access Denied',
    message: 'You do not have permission to access this record.',
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    textColor: 'text-slate-800',
  },
};

export function AccessErrorScreen({ code }: { code: ErrorCode }) {
  const config = ERROR_CONFIG[code] ?? ERROR_CONFIG.TOKEN_INVALID;

  return (
    <div className={`min-h-screen ${config.bg} flex flex-col items-center justify-center px-6`}>
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-5 text-4xl`}>
          {config.icon}
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold ${config.textColor} mb-3`}>{config.title}</h1>

        {/* Message */}
        <p className="text-sm text-slate-600 leading-relaxed mb-8">{config.message}</p>

        {/* Visual separator */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400">Health Wallet · Patient-Controlled Access</p>
        </div>
      </div>
    </div>
  );
}
