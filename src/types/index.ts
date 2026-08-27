// ─────────────────────────────────────────────
//  Health Wallet — Core Data Models
//  Matches Phase 1 data model definitions exactly
// ─────────────────────────────────────────────

// ── Actor 1: Patient (base) ───────────────────
export interface Patient {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

// ── Patient Profile (extended with appointment/form fields) ──
export interface PatientProfile extends Patient {
  phone: string | null;
  date_of_birth: string | null;       // ISO date "YYYY-MM-DD"
  emergency_contact: string | null;
  allergies: string | null;
  current_medications: string | null;
}

// ─────────────────────────────────────────────
//  Appointment Form — new in dashboard phase
// ─────────────────────────────────────────────

export interface AppointmentFormData {
  name: string;
  phone: string;
  dateOfBirth: string;         // ISO date
  emergencyContact: string;
  allergies?: string;
  currentMedications?: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  source: {
    type: 'qr_scan' | 'manual_entry';
    rawCode?: string;          // whatever was scanned/entered
    hospitalId?: string;       // reserved for future hospital integration
    hospitalName?: string;     // reserved for future hospital integration
  };
  formData: AppointmentFormData;
  status: 'draft' | 'submitted';
  createdAt: string;
  submittedAt?: string;
  // Reserved for future doctor-side prescription phase — leave undefined now.
  prescription?: {
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    doctorInstructions?: string;
    followUpDate?: string;
    prescribedAt?: string;
    prescribedBy?: string;
  };
}

// ── Medical Record ────────────────────────────
export type RecordType =
  | 'lab_report'
  | 'prescription'
  | 'imaging'
  | 'consultation'
  | 'vaccination'
  | 'discharge_summary';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  title: string;
  type: RecordType;
  provider_name: string;
  record_date: string;        // ISO date string
  description: string;
  file_url: string | null;    // demo: null (structured data used instead)
  created_at: string;
}

// ── Actor 2: Healthcare Provider / Doctor ─────
export interface Provider {
  id: string;
  name: string;
  organization: string;
  specialty: string;
}

// ── Access Grant ──────────────────────────────
export type AccessGrantStatus =
  | 'ACTIVE'
  | 'REVOKED'
  | 'EXPIRED';

export interface AccessGrant {
  id: string;
  patient_id: string;
  provider_id: string;
  status: AccessGrantStatus;
  expires_at: string;         // ISO datetime
  created_at: string;
  revoked_at: string | null;
}

// ── Access Grant ↔ Records (join table) ───────
export interface AccessGrantRecord {
  id: string;
  access_grant_id: string;
  medical_record_id: string;
}

// ── Access Token (the QR / link token) ────────
export interface AccessToken {
  id: string;
  access_grant_id: string;
  token: string;              // opaque UUID — carries no medical data
  created_at: string;
  expires_at: string;
}

// ── Access Log (audit trail) ──────────────────
export type AccessAction =
  | 'ACCESS_GRANTED'
  | 'ACCESS_SESSION_OPENED'
  | 'RECORD_VIEWED'
  | 'ACCESS_REVOKED'
  | 'ACCESS_EXPIRED'
  | 'ACCESS_DENIED';

export interface AccessLog {
  id: string;
  patient_id: string;
  provider_id: string;
  access_grant_id: string;
  action: AccessAction;
  metadata: Record<string, unknown> | null;  // e.g. { record_id: "..." }
  timestamp: string;
}

// ─────────────────────────────────────────────
//  Composite / View Types (used by API responses)
// ─────────────────────────────────────────────

// Full access grant with provider info and which records are shared
export interface AccessGrantWithDetails extends AccessGrant {
  provider: Provider;
  records: MedicalRecord[];
  token: string | null;       // the active access token value
}

// What the doctor portal receives after token validation
export interface ProviderAccessSession {
  grant: AccessGrant;
  provider: Provider;
  patient_name: string;
  records: MedicalRecord[];
  expires_at: string;
}

// Access history row shown to the patient
export interface AccessHistoryEntry {
  grant_id: string;
  provider: Provider;
  status: AccessGrantStatus;
  records_shared: Pick<MedicalRecord, 'id' | 'title' | 'type'>[];
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_action: AccessAction | null;
  last_action_at: string | null;
}

// ─────────────────────────────────────────────
//  API Response Shapes
// ─────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code:
    | 'ACCESS_REVOKED'
    | 'ACCESS_EXPIRED'
    | 'ACCESS_DENIED'
    | 'TOKEN_INVALID'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'SERVER_ERROR';
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─────────────────────────────────────────────
//  Access Duration Options (Phase 4 wizard)
// ─────────────────────────────────────────────

export type AccessDuration =
  | '1_MINUTE'    // demo shortcut for judges
  | '30_MINUTES'
  | '24_HOURS'
  | '7_DAYS'
  | 'UNTIL_REVOKED';

export const ACCESS_DURATION_LABELS: Record<AccessDuration, string> = {
  '1_MINUTE': '1 Minute (Demo)',
  '30_MINUTES': '30 Minutes',
  '24_HOURS': '24 Hours',
  '7_DAYS': '7 Days',
  'UNTIL_REVOKED': 'Until Manually Revoked',
};

export const ACCESS_DURATION_MS: Record<AccessDuration, number | null> = {
  '1_MINUTE': 60 * 1000,
  '30_MINUTES': 30 * 60 * 1000,
  '24_HOURS': 24 * 60 * 60 * 1000,
  '7_DAYS': 7 * 24 * 60 * 60 * 1000,
  'UNTIL_REVOKED': null,  // null = 100 years effectively
};
