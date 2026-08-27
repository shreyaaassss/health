/**
 * API Endpoint Registry
 * Centralized map of all API routes used in the application.
 * Matches the planned route structure from Phase 1.
 */

export const API = {
  // ── Patient: Records ────────────────────────
  patient: {
    records:        '/api/patient/records',
    record:         (id: string) => `/api/patient/records/${id}`,

    // ── Patient: Access Grants ─────────────────
    grants:         '/api/patient/grants',
    grant:          (id: string) => `/api/patient/grants/${id}`,
    revokeGrant:    (id: string) => `/api/patient/grants/${id}/revoke`,

    // ── Patient: Access History ────────────────
    history:        '/api/patient/history',

    // ── Patient: Providers list ────────────────
    providers:      '/api/patient/providers',

    // ── Patient: Profile ───────────────────────
    profile:        '/api/patient/profile',

    // ── Patient: Appointments ──────────────────
    appointments:   '/api/patient/appointments',
  },

  // ── Provider Portal ──────────────────────────
  provider: {
    // Validate token and return session + authorized records
    session:        (token: string) => `/api/provider/access/${token}`,
    // Fetch a specific record (re-validates token on every call)
    record:         (token: string, recordId: string) =>
                      `/api/provider/access/${token}/records/${recordId}`,
  },

  // ── Demo Utilities ────────────────────────────
  demo: {
    reset:          '/api/demo/reset',
  },
} as const;

// ── App Routes (frontend pages) ───────────────
export const ROUTES = {
  patient: {
    home:        '/patient',
    records:     '/patient/records',
    record:      (id: string) => `/patient/records/${id}`,
    share:       '/patient/share',
    access:      '/patient/access',
    history:     '/patient/history',
    profile:     '/patient/profile',
    appointment: '/patient/appointment',
    appointmentForm: '/patient/appointment/form',
  },
  provider: {
    access:     (token: string) => `/provider/access/${token}`,
  },
  demo: {
    reset:      '/demo/reset',
  },
} as const;
