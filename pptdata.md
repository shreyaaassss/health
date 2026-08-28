# Health Wallet — Tech Stack & System Architecture

---

## Product in One Line

A patient-owned medical records PWA where patients securely share selected health records with doctors, control access duration, and revoke it instantly — with real-time doctor dashboards and prescription management.

---

## Tech Stack

### Frontend
| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 16.3 (App Router)** | Server components, file-based routing, built-in PWA support, Turbopack |
| Language | **TypeScript** | End-to-end type safety across client and server |
| Styling | **Tailwind CSS v4** + inline design tokens | Utility-first, CSS variables for the design system |
| Font | **Plus Jakarta Sans** | Healthcare-appropriate, readable at all sizes |
| State | **React useState / useTransition** | No external state library — server components handle data |
| PWA | **Native Next.js manifest + Service Worker** | Installable on Android/iOS, offline app shell |
| QR Code | **react-qr-code** | Renders access token as scannable QR |
| QR Scanner | **html5-qrcode** | Camera-based QR scanning in browser (no native app) |
| File Upload | **Supabase Storage SDK** | Direct browser → Storage upload with RLS |

### Backend
| Layer | Technology | Why |
|---|---|---|
| Runtime | **Next.js API Routes (Edge-compatible)** | Co-located with frontend, no separate server |
| Auth | **Supabase Auth** (email/password) | Built-in JWT, session cookies, admin user management |
| Database | **PostgreSQL via Supabase** | Relational, JSONB for flexible fields, stored functions |
| Storage | **Supabase Storage** | Private bucket, RLS-protected, signed URLs for time-limited access |
| Admin Client | **supabase-js (service role)** | Server-side operations, bypasses RLS where needed |
| Middleware | **Next.js Middleware (Proxy)** | Route protection, auth redirect before page render |

### Infrastructure
| Layer | Technology |
|---|---|
| Hosting | **Vercel** (auto-deploy from GitHub main branch) |
| Database | **Supabase** (managed PostgreSQL, Singapore region) |
| Storage | **Supabase Storage** (S3-compatible, private bucket) |
| Repository | **GitHub** (github.com/shreyaaassss/health) |

---

## Database Schema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│    auth.users   │     │    patients       │     │    providers        │
│ (Supabase Auth) │◄────│  id (PK)          │     │  id (PK)            │
│  id             │     │  name             │     │  name               │
│  email          │     │  email            │     │  organization        │
│  password hash  │     │  user_id (FK)     │     │  specialty          │
└─────────────────┘     │  phone            │     │  user_id (FK)       │
                        │  date_of_birth    │     └──────────────────────┘
                        │  emergency_contact│
                        │  allergies        │
                        │  current_meds     │
                        └──────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
┌─────────────────────┐  ┌───────────────┐  ┌──────────────────┐
│  medical_records    │  │ access_grants │  │  appointments    │
│  id (PK)            │  │ id (PK)       │  │  id (PK)         │
│  patient_id (FK)    │  │ patient_id FK │  │  patient_id FK   │
│  title              │  │ provider_id FK│  │  provider_id FK  │
│  type (enum)        │  │ status        │  │  reason          │
│  provider_name      │  │ expires_at    │  │  preferred_date  │
│  record_date        │  │ revoked_at    │  │  status          │
│  description        │  └───────────────┘  │  confirmed_date  │
│  file_url           │         │           └──────────────────┘
│  file_name          │    ┌────┴────────────────┐
│  file_type          │    │                     │
└─────────────────────┘    ▼                     ▼
         │         ┌──────────────┐    ┌─────────────────┐
         │         │access_grant  │    │  access_tokens  │
         │         │_records      │    │  id (PK)        │
         ▼         │(join table)  │    │  grant_id FK    │
┌────────────────┐ └──────────────┘    │  token (UUID)   │
│  prescriptions │                     │  expires_at     │
│  id (PK)       │      ┌──────────────────────────────┐
│  patient_id FK │      │         access_logs           │
│  provider_id FK│      │  id · patient_id · provider_id│
│  medical_record│      │  access_grant_id · action     │
│  _id FK        │      │  metadata · timestamp         │
│  medications   │      └──────────────────────────────┘
│  instructions  │
│  follow_up_date│      ┌──────────────────────────────┐
└────────────────┘      │     appointment_records       │
                        │  (pre-visit check-in form)    │
                        │  patient_id · form_data JSONB │
                        └──────────────────────────────┘
```

### Key Enums & Types
```
record_type:        lab_report | prescription | imaging | consultation | vaccination | discharge_summary
access_grant_status: ACTIVE | REVOKED | EXPIRED
access_action:      ACCESS_GRANTED | ACCESS_SESSION_OPENED | RECORD_VIEWED | ACCESS_REVOKED | ACCESS_EXPIRED | ACCESS_DENIED
appointment_status: pending | confirmed | cancelled
```

---

## System Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │              VERCEL (Edge CDN)               │
                    │                                              │
                    │  ┌─────────────────────────────────────┐   │
                    │  │         Next.js 16 App               │   │
                    │  │                                       │   │
                    │  │  ┌──────────────┐  ┌─────────────┐  │   │
                    │  │  │ Patient PWA  │  │ Doctor PWA  │  │   │
                    │  │  │ /patient/*   │  │ /doctor     │  │   │
                    │  │  │ Server Comp  │  │ Server Comp │  │   │
                    │  │  └──────┬───────┘  └──────┬──────┘  │   │
                    │  │         │                  │          │   │
                    │  │  ┌──────▼──────────────────▼──────┐  │   │
                    │  │  │      API Routes (/api/*)        │  │   │
                    │  │  │  patient/records  patient/grants│  │   │
                    │  │  │  patient/book     doctor/appts  │  │   │
                    │  │  │  provider/access/[token]        │  │   │
                    │  │  └──────────────┬─────────────────┘  │   │
                    │  │                 │                      │   │
                    │  │  ┌──────────────▼─────────────────┐  │   │
                    │  │  │    Provider Portal (token-based)│  │   │
                    │  │  │    /provider/access/[token]     │  │   │
                    │  │  │    No auth session required     │  │   │
                    │  │  └──────────────┬─────────────────┘  │   │
                    │  └─────────────────│─────────────────────┘   │
                    └────────────────────│─────────────────────────┘
                                         │
                    ┌────────────────────▼─────────────────────────┐
                    │              SUPABASE                         │
                    │                                               │
                    │  ┌──────────────┐   ┌─────────────────────┐  │
                    │  │  Auth        │   │  PostgreSQL          │  │
                    │  │  (JWT/Cookie)│   │  + Row Level Security│  │
                    │  │              │   │  + Stored Functions  │  │
                    │  └──────────────┘   └─────────────────────┘  │
                    │                                               │
                    │  ┌──────────────────────────────────────┐    │
                    │  │  Storage (private bucket)             │    │
                    │  │  medical-records/{user_id}/{uuid}.ext │    │
                    │  │  RLS: owner read/write only           │    │
                    │  │  Signed URLs for doctor access        │    │
                    │  └──────────────────────────────────────┘    │
                    └───────────────────────────────────────────────┘
```

---

## Access Control Architecture

The core security primitive — every provider record request runs through 5 checks:

```
Doctor scans QR
       │
       ▼
   Token exists?  ──NO──► TOKEN_INVALID (403)
       │YES
       ▼
   Grant status = ACTIVE?  ──NO──► ACCESS_REVOKED (403)
       │YES
       ▼
   now < expires_at?  ──NO──► ACCESS_EXPIRED (403) + marks EXPIRED in DB
       │YES
       ▼
   Record in grant?  ──NO──► ACCESS_DENIED (403)
       │YES
       ▼
   Return record + signed URL (valid 1 hour)
       │
       ▼
   Log RECORD_VIEWED to access_logs
```

This logic lives in **`can_access_record(token, record_id)`** — a PostgreSQL stored function with `SECURITY DEFINER`. It runs as a single DB round-trip.

**Patient revokes access → next doctor request returns `ACCESS_REVOKED` immediately.** No delay. No cache.

---

## Key Design Decisions

| Decision | What | Why |
|---|---|---|
| **Token-based provider access** | Doctors access records via opaque UUID token, not login session | No doctor registration on patient side; works across devices via QR |
| **Service-role client for access validation** | `access.ts` uses admin client, not anon | Provider portal has no user session; RLS would block queries with `auth.uid() = null` |
| **`force-dynamic` on all patient pages** | `export const dynamic = 'force-dynamic'` | User-specific data must never be statically cached |
| **Lazy expiry** | `expires_at` checked on every request, marked EXPIRED then | No cron job needed; consistent state |
| **Signed URLs for files** | Supabase Storage signed URL (1hr) returned by API after grant validation | File access revokes when grant expires — URL is worthless after revocation |
| **JSONB for medications** | `prescriptions.medications` stored as JSONB array | Flexible schema for varying medication counts without extra join table |
| **Cascade deletes** | `medical_record_id` in prescriptions has `ON DELETE CASCADE` | Deleting a record auto-cleans its prescriptions |

---

## User Roles & Access

| Role | Auth | Can do |
|---|---|---|
| **Patient** | Email/password via Supabase Auth | Register, upload records, share with doctors, revoke access, book appointments |
| **Doctor** | Email/password (admin-seeded, no public registration) | View shared records, add prescriptions, confirm appointments, scan QR |
| **Provider Portal** | Token only (no login required) | View authorized records, download files — access is time-limited and revocable |

---

## API Surface

```
Patient APIs (session-authenticated)
  GET  /api/patient/records           — list own records
  POST /api/patient/records           — add new record
  GET  /api/patient/records/[id]      — get single record
  DELETE /api/patient/records/[id]    — delete record + file from storage
  GET  /api/patient/grants            — list access grants (with provider + records)
  POST /api/patient/grants            — create access grant → returns token
  POST /api/patient/grants/[id]/revoke — revoke grant → instant denial
  POST /api/patient/grants/sweep      — mark expired grants
  GET  /api/patient/history           — full audit log with timelines
  GET  /api/patient/profile           — get profile
  PATCH /api/patient/profile          — update profile
  GET  /api/patient/providers         — list all doctors
  GET  /api/patient/book              — list appointments
  POST /api/patient/book              — book appointment
  PATCH /api/patient/book/[id]        — cancel appointment
  GET  /api/patient/prescriptions     — list received prescriptions
  GET  /api/patient/appointments      — appointment form records

Doctor APIs (session-authenticated)
  GET  /api/doctor/appointments       — list incoming appointment requests
  PATCH /api/doctor/appointments/[id] — confirm or cancel
  GET  /api/doctor/accesses          — recent patient access grants

Provider Portal APIs (token-authenticated, no session)
  GET  /api/provider/access/[token]                      — validate session
  GET  /api/provider/access/[token]/records/[recordId]   — get record + signed URL
  POST /api/provider/access/[token]/prescriptions        — add prescription

Auth API
  POST /api/auth/register             — create patient account (server-side, admin client)

Demo
  POST /api/demo/reset                — clear all grants/logs, restore seed data
```

---

## PWA Configuration

```json
{
  "name": "Health Wallet",
  "short_name": "HealthWallet",
  "start_url": "/patient",
  "display": "standalone",
  "theme_color": "#2F6BFF",
  "background_color": "#0f172a",
  "shortcuts": [
    { "name": "My Records", "url": "/patient/records" },
    { "name": "Share Records", "url": "/patient/share" }
  ]
}
```

Service Worker strategy: **Network-first for navigation, Cache-first for static assets, no caching for `/api/*`**.

---

## Migrations Timeline

| Migration | What |
|---|---|
| `001_initial_schema.sql` | Core tables: patients, providers, medical_records, access_grants, access_grant_records, access_tokens, access_logs. `can_access_record()` stored function. Seed data. |
| `002_demo_reset_function.sql` | `reset_demo_data()` stored function |
| `003_fix_reset_function.sql` | Fixed DELETE scoping in reset function |
| `004_appointments.sql` | patients profile columns (phone, DOB, etc.) + appointment_records table |
| `005_auth.sql` | `user_id` FK on patients + providers. RLS enabled on all 7 tables. |
| `006_file_uploads.sql` | `file_name`, `file_size`, `file_type` on medical_records. Supabase Storage bucket + RLS. |
| `007_appointment_booking.sql` | `appointments` table for two-way booking system |
| `008_prescriptions.sql` | `prescriptions` table + `cancelled_by` on appointments |
| `009_prescription_record_link.sql` | `medical_record_id` FK on prescriptions (ON DELETE CASCADE) |
