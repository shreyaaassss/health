# Phase-Wise Implementation Plan

## Project Scope

This implementation plan covers **only the PWA version of the product** and the complete demo flow discussed earlier.

The LLM functionality is intentionally **out of scope for this implementation plan**. The objective is to first build a polished, functional, phone-first Progressive Web Application that demonstrates patient-owned medical records, controlled sharing, provider access, access expiry, revocation, and access history.

The end goal is not to build a complete national healthcare infrastructure. The end goal is to deliver a convincing working MVP that demonstrates the following journey:

> **Patient opens their PWA → views medical records → grants a doctor access to selected records → doctor accesses only the authorized records → patient revokes access → doctor's access immediately stops → patient can see the access history.**

---

# End Goal

By the completion of all phases, the project should be a working **Progressive Web Application (PWA)** with:

- A patient-facing mobile-first application
- Installable PWA behavior
- Offline-friendly application shell
- A medical records dashboard
- Medical record detail pages
- Granular record sharing
- Provider-specific access permissions
- Time-based access
- QR code or secure sharing link
- A doctor/provider access portal
- Server-side access validation
- Instant access revocation
- Expired access handling
- Access history and audit logs
- A complete end-to-end demo flow

---

# Phase 0: Define the MVP Boundary

## Goal

Clearly define what will and will not be built before development starts.

The goal of this phase is to prevent scope creep and ensure every future technical decision supports the demo.

## What is to be achieved

A written MVP scope and a single successful demo journey.

### Core Demo Journey

```text
Patient
   ↓
Opens Health Wallet PWA
   ↓
Views medical records
   ↓
Selects "Share Records"
   ↓
Chooses provider
   ↓
Selects specific records
   ↓
Sets access duration
   ↓
Generates QR / secure access link
   ↓
Doctor accesses authorized records
   ↓
Patient revokes access
   ↓
Doctor immediately loses access
   ↓
Patient views access history
```

## In Scope

- PWA
- Patient identity for demo purposes
- Sample medical records
- Record dashboard
- Record details
- Grant access
- Select records
- Set access duration
- Generate share link or QR code
- Doctor/provider portal
- Access validation
- Revoke access
- Access expiry
- Access history

## Out of Scope

For this version, do not build:

- Local LLM
- Medical diagnosis
- AI chatbot
- Diet recommendations
- Exercise recommendations
- Real hospital integrations
- ABDM integration unless specifically required later
- Blockchain
- Full nationwide interoperability
- Complex OCR pipelines
- Real production-grade healthcare certification

## Deliverable

A one-page MVP definition and final demo journey that the entire implementation follows.

## Completion Criteria

The team should be able to explain the entire product in one sentence:

> A patient-owned medical record PWA where users can securely share selected health records with healthcare providers and revoke that access at any time.

---

# Phase 1: Product and Data Flow Design

## Goal

Design how data and access will move through the system before building the user interface.

The goal is to establish a simple architecture that can support the demo without unnecessary complexity.

## What is to be achieved

Define the main actors:

### Actor 1: Patient

The owner of the medical records.

The patient can:

- View records
- View record details
- Grant access
- Select what is shared
- Define access duration
- Revoke access
- View access history

### Actor 2: Healthcare Provider / Doctor

The provider can:

- Open a secure access link
- Validate their access
- View only authorized records
- Lose access when permission expires or is revoked

### Actor 3: Backend

The backend manages:

- Patient records
- Providers
- Access grants
- Access tokens
- Access status
- Expiry
- Revocation
- Audit logs

## Core Data Flow

```text
Patient PWA
    |
    | Requests Records
    v
Backend / API
    |
    v
Medical Record Store
```

For sharing:

```text
Patient PWA
    |
    | Creates Access Grant
    v
Backend
    |
    | Creates Secure Access Token
    v
QR Code / Secure Link
    |
    v
Doctor Portal
    |
    | Validates Token
    v
Backend Permission Check
    |
    +----------------------------+
    |                            |
    v                            v
Access Active                Access Invalid
    |                            |
    v                            v
Show Authorized Records      Deny Access
```

## Recommended Core Data Models

### Patient

```text
Patient
- id
- name
- email or demo identifier
- created_at
```

### Medical Record

```text
MedicalRecord
- id
- patient_id
- title
- type
- provider_name
- record_date
- description
- file_url or structured demo data
- created_at
```

### Provider

```text
Provider
- id
- name
- organization
- specialty
```

### Access Grant

```text
AccessGrant
- id
- patient_id
- provider_id
- status
- expires_at
- created_at
- revoked_at
```

### Access Grant Records

This connects one access grant to one or more selected medical records.

```text
AccessGrantRecord
- id
- access_grant_id
- medical_record_id
```

### Access Token

```text
AccessToken
- id
- access_grant_id
- token
- created_at
- expires_at
```

### Access Log

```text
AccessLog
- id
- patient_id
- provider_id
- access_grant_id
- action
- timestamp
```

Possible actions:

- ACCESS_GRANTED
- RECORD_VIEWED
- ACCESS_REVOKED
- ACCESS_EXPIRED
- ACCESS_DENIED

## Deliverable

A basic architecture diagram and database/data model.

## Completion Criteria

Before moving forward, the team should know exactly how the system will answer:

> "Can this provider access this specific record right now?"

---

# Phase 2: Project Setup and PWA Foundation

## Goal

Create the technical foundation for the application as a **Progressive Web Application**.

The application should be mobile-first and designed to work like an application when opened on a phone.

## What is to be achieved

Set up:

- Frontend project
- Backend/API project
- Database
- Environment configuration
- Basic routing
- Authentication or demo identity
- PWA configuration

## PWA Requirements

The application must include:

### Web App Manifest

Configure:

- Application name
- Short name
- Icons
- Theme color
- Display mode
- Start URL

The PWA should support installation to a phone home screen.

### Service Worker

Add a service worker to support:

- Application shell caching
- Offline-friendly loading
- Cached static assets

For the MVP, the priority is not full offline record synchronization. The goal is to ensure the PWA itself behaves reliably and can launch like an installed application.

### Mobile-First UI

The interface should be designed primarily for phone screens.

Important screens should work comfortably on:

- iQOO phone
- Android mobile browser
- Installed PWA mode

## Suggested Application Structure

```text
/src
  /components
  /pages
  /features
    /records
    /sharing
    /access-history
  /services
  /utils
  /pwa
```

## Deliverable

An installable PWA shell with placeholder screens.

## Completion Criteria

The application should:

- Open on a phone
- Be installable
- Launch from the home screen
- Load the main application shell
- Navigate between placeholder pages

---

# Phase 3: Build the Patient Health Wallet

## Goal

Build the main patient-facing experience.

The goal is to make the patient immediately understand:

> These are my medical records.

## What is to be achieved

Create the main dashboard.

### Main Screen

```text
Hello, Patient

MY HEALTH RECORDS

[ Blood Test ]
Provider: City Hospital
Date: March 2026

[ Prescription ]
Provider: Dr. Mehta
Date: February 2026

[ MRI Report ]
Provider: Pune Diagnostics
Date: January 2026

[ Vaccination Record ]

[ Previous Consultation ]
```

## Required Features

### Record List

Display sample records by category.

Possible categories:

- Lab Reports
- Prescriptions
- Imaging
- Consultations
- Vaccinations

### Record Detail Screen

When a record is opened, show:

- Record title
- Provider
- Date
- Type
- Description
- Sample document or preview

For the hackathon demo, records can be preloaded sample records.

## Important Principle

Do not spend excessive time building complex medical record ingestion.

The purpose of this phase is to create a polished and believable health wallet.

## Deliverable

A complete patient records dashboard and record detail flow.

## Completion Criteria

A judge should be able to open the PWA and immediately browse multiple medical records.

---

# Phase 4: Build the Record Sharing Flow

## Goal

Allow the patient to intentionally share selected medical records with a healthcare provider.

This is the beginning of the core product functionality.

## What is to be achieved

Create a guided sharing workflow.

### Step 1: Select Provider

The patient selects a provider.

For the demo:

```text
Share With

Dr. Sharma
Bangalore Health Clinic
```

The provider can initially come from a preloaded demo list.

### Step 2: Select Records

The patient explicitly chooses which records to share.

Example:

```text
Select Records

[x] Blood Test Report
[x] Prescription
[x] Previous Consultation
[ ] MRI Report
[ ] Vaccination Record
```

### Step 3: Select Access Duration

Options:

- 30 minutes
- 24 hours
- 7 days
- Until manually revoked

### Step 4: Review

Show:

```text
You are sharing:

Provider:
Dr. Sharma

Records:
3 selected

Duration:
24 hours
```

### Step 5: Confirm

When the patient confirms:

- Create an Access Grant
- Attach selected records
- Set expiry
- Generate a secure token
- Create an audit log

## Deliverable

A complete patient-side sharing workflow.

## Completion Criteria

The patient can successfully create a controlled access grant for selected records.

---

# Phase 5: Generate the Provider Access Mechanism

## Goal

Create the bridge between the patient and doctor/provider.

The provider needs a simple way to enter the authorized record experience.

## What is to be achieved

Generate either:

- A secure share link
- A QR code containing or linking to the access token

For the hackathon demo, using both is ideal.

### Example

```text
Access Created Successfully

Dr. Sharma can now access 3 selected records.

[ SHOW QR CODE ]

[ COPY SECURE LINK ]
```

## QR Code Flow

```text
Patient PWA
    |
    v
Generate Access Token
    |
    v
Generate QR Code
    |
    v
Doctor scans QR
    |
    v
Doctor Portal opens
```

## Security Logic

The token should not directly expose medical data.

Instead:

```text
Token
   |
   v
Backend
   |
   v
Validate:
- Token exists?
- Access grant active?
- Expired?
- Revoked?
- Provider allowed?
   |
   v
Return only authorized records
```

## Deliverable

Working QR code or secure link that opens the provider access flow.

## Completion Criteria

A patient can create access on one device and a provider can open the corresponding access session.

---

# Phase 6: Build the Doctor / Provider Portal

## Goal

Demonstrate that healthcare providers can access the patient's records, but only within the permissions granted by the patient.

## What is to be achieved

Create a separate provider-facing view.

### Provider Screen

```text
Patient Medical Records

Access granted by:
Patient

Access expires:
Tomorrow, 10:30 AM

Available Records

[ Blood Test Report ]
[ Prescription ]
[ Previous Consultation ]
```

The provider must not see records that were not selected.

For example, if the MRI report was not shared, it should not appear anywhere in the provider portal.

## Required Validation

Every provider access request should check:

```text
Is the access token valid?

AND

Is the access grant active?

AND

Has the access expired?

AND

Has the patient revoked access?

AND

Is this requested record included in the grant?
```

Only then should the record be returned.

## Audit Logging

When the provider opens the portal:

```text
ACCESS_GRANTED / ACCESS_SESSION_OPENED
```

When a provider views a record:

```text
RECORD_VIEWED
```

## Deliverable

A working provider portal connected to backend authorization logic.

## Completion Criteria

The provider can access only the exact records that the patient selected.

---

# Phase 7: Implement Access Revocation

## Goal

Give the patient immediate control over previously granted access.

This is the most important feature for the demo.

## What is to be achieved

Create an Active Access section in the patient PWA.

### Example

```text
ACTIVE ACCESS

Dr. Sharma
Bangalore Health Clinic

Access:
Blood Test
Prescription
Consultation Notes

Expires:
24 hours

[ REVOKE ACCESS ]
```

## Revocation Logic

When the patient presses:

# REVOKE ACCESS

The backend should:

1. Change AccessGrant status to REVOKED
2. Store revoked_at timestamp
3. Invalidate the active access token
4. Create an access log
5. Ensure future provider requests fail authorization

## Provider Experience After Revocation

The provider should immediately see:

```text
ACCESS REVOKED

The patient has revoked access to these medical records.
```

If the provider refreshes the page or tries to open another record, the backend must deny access.

## Important Implementation Principle

Do not rely only on hiding records on the frontend.

Every record request must be validated by the backend.

The flow must be:

```text
Provider requests record
        |
        v
Backend validates access status
        |
        +---------------------+
        |                     |
        v                     v
Active                  Revoked / Expired
        |                     |
        v                     v
Return Record           Return Access Denied
```

## Deliverable

A real working revocation mechanism.

## Completion Criteria

A patient revokes access and the provider immediately loses the ability to retrieve the authorized records.

---

# Phase 8: Implement Access Expiry

## Goal

Ensure access automatically ends when the selected sharing period is over.

## What is to be achieved

Support access durations such as:

- 30 minutes
- 24 hours
- 7 days

The backend should compare the current time against expires_at.

## Access Validation Logic

```text
IF status == REVOKED
    deny access

ELSE IF current_time > expires_at
    deny access
    mark access as EXPIRED

ELSE
    allow access
```

For the live demo, it may be useful to include a short demo duration such as:

- 1 minute

This allows the judges to see an expiry flow without waiting for 24 hours.

## Deliverable

Automatic access expiry.

## Completion Criteria

An expired token can no longer retrieve patient records.

---

# Phase 9: Build Access History and Audit Trail

## Goal

Give the patient visibility into how their records have been shared and accessed.

## What is to be achieved

Create an Access History screen.

### Example

| Provider | Records | Status |
|---|---|---|
| Dr. Sharma | Blood Report, Prescription | Revoked |
| City Hospital | Full Demo Record Set | Expired |
| Dr. Mehta | Vaccination Record | Active |

A detail view can show:

- When access was granted
- What records were shared
- When access was opened
- Which records were viewed
- When access expired or was revoked

## Suggested Timeline

```text
10:30 AM
Access granted to Dr. Sharma

10:32 AM
Dr. Sharma opened Blood Test Report

10:35 AM
Patient revoked access
```

## Deliverable

A patient-facing access history and audit log.

## Completion Criteria

The patient can clearly answer:

> Who has accessed my records, what did I share, and is that access still active?

---

# Phase 10: Integrate the Complete Demo Journey

## Goal

Connect every feature into one smooth demonstration.

At this point, individual features may work separately. This phase ensures they work as one complete product.

## What is to be achieved

Test the complete journey:

### Step 1

Open the Health Wallet PWA.

### Step 2

Show the patient's medical records.

### Step 3

Open a few record details.

### Step 4

Click Share Medical Records.

### Step 5

Select Dr. Sharma.

### Step 6

Select three records.

### Step 7

Set access duration.

### Step 8

Generate the QR code or secure access link.

### Step 9

Open the provider portal on a second device or browser.

### Step 10

Show that only the selected records are visible.

### Step 11

Return to the patient PWA.

### Step 12

Open Active Access.

### Step 13

Click Revoke Access.

### Step 14

Immediately switch back to the provider portal.

### Step 15

Refresh or open another record.

### Step 16

Show:

# Access Revoked

### Step 17

Return to the patient PWA.

### Step 18

Show Access History.

## Deliverable

A fully rehearsed end-to-end demo.

## Completion Criteria

The entire demo can be performed without manual database edits, code changes, or developer intervention.

---

# Phase 11: PWA Reliability and Mobile Polish

## Goal

Make the product feel like a real mobile application rather than a website.

## What is to be achieved

### Mobile Optimization

Ensure:

- Buttons are easy to tap
- Important actions are reachable with one hand where possible
- Screens work correctly on the target iQOO device
- Text is readable
- QR codes are easy to scan

### PWA Testing

Test:

- Installation
- Home screen launch
- Reload behavior
- Basic offline application shell
- Cached static assets

### Demo Recovery

The demo should survive common problems such as:

- Accidental refresh
- Returning to the home screen
- Reopening the installed PWA

## Deliverable

A polished, phone-first installable PWA.

## Completion Criteria

The application should feel natural when used on the hackathon phone.

---

# Phase 12: Testing and Demo Hardening

## Goal

Eliminate failure points before the final presentation.

## What is to be achieved

## Functional Testing

Test:

- Record loading
- Record details
- Record selection
- Access creation
- QR generation
- Provider access
- Unauthorized record access
- Revocation
- Expiry
- Access history

## Negative Testing

Specifically test:

### Scenario 1

Provider tries to access a record that was not shared.

Expected:

> Access denied.

### Scenario 2

Provider tries to access a revoked link.

Expected:

> Access revoked.

### Scenario 3

Provider tries to access an expired link.

Expected:

> Access expired.

### Scenario 4

Patient creates multiple access grants.

Expected:

Each provider receives only their own permissions.

### Scenario 5

Patient revokes access while the provider portal is open.

Expected:

The next backend request should fail.

## Demo Reset Strategy

Create a reset mechanism for the demo.

For example:

```text
Reset Demo Data
```

This should restore:

- Sample records
- Demo patient
- Demo provider
- No active or revoked test access grants

This is useful if the demo needs to be repeated.

## Deliverable

A stable, repeatable demo environment.

## Completion Criteria

The demo can be repeated multiple times with the same expected result.

---

# Recommended Implementation Order

The recommended build order is:

```text
Phase 0
Define MVP
   ↓
Phase 1
Data and Access Architecture
   ↓
Phase 2
PWA Foundation
   ↓
Phase 3
Patient Health Wallet
   ↓
Phase 4
Record Sharing
   ↓
Phase 5
QR / Secure Access Link
   ↓
Phase 6
Provider Portal
   ↓
Phase 7
Access Revocation
   ↓
Phase 8
Access Expiry
   ↓
Phase 9
Access History
   ↓
Phase 10
End-to-End Demo Integration
   ↓
Phase 11
PWA Mobile Polish
   ↓
Phase 12
Testing and Demo Hardening
```

---

# Minimum Viable Architecture

For the first working version, keep the architecture simple.

```text
                 +----------------------+
                 |      PATIENT PWA     |
                 | Mobile-First Client  |
                 +----------+-----------+
                            |
                            v
                    +---------------+
                    |   Backend API |
                    +-------+-------+
                            |
              +-------------+-------------+
              |                           |
              v                           v
      +---------------+           +---------------+
      | Medical       |           | Access /      |
      | Records Store |           | Consent Store |
      +---------------+           +---------------+
                            |
                            v
                    +---------------+
                    | Access Logs   |
                    +---------------+

                            ^
                            |
                 +----------+-----------+
                 |    PROVIDER PORTAL   |
                 +----------------------+
```

The PWA and provider portal can initially be part of the same frontend application with different routes.

For example:

```text
/patient
/patient/records
/patient/share
/patient/access
/provider/access/:token
```

This reduces implementation complexity.

---

# Final MVP Definition

At the end of this implementation plan, the project should demonstrate a complete working **patient-owned medical records PWA**.

The patient should be able to:

1. Open an installed PWA on a phone.
2. View their medical records.
3. Choose a healthcare provider.
4. Select exactly which records to share.
5. Set a duration for access.
6. Generate a QR code or secure link.
7. Allow the provider to view only those records.
8. Revoke access at any time.
9. Immediately prevent further provider access.
10. Review the history of granted, active, expired, and revoked access.

---

# Success Criteria

The MVP is successful if a judge can understand the entire value proposition through the live demo:

> **The patient owns the medical record.**

The patient controls:

- Who can access the data
- Which records they can access
- How long they can access them
- When that access ends

The final product should communicate one simple idea clearly:

# Your Health. Your Data. Your Control.
