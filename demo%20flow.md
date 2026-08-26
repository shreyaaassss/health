# Demo Flow

## Product Overview

A privacy-first, patient-owned digital health wallet that allows users to securely carry their medical records across hospitals and cities.

The patient remains in control of their data and can:

- View and manage their medical records
- Grant access to selected healthcare providers
- Control which records are shared
- Set how long access remains active
- Revoke access at any time
- View a history of who accessed their data
- Generate a concise health summary using a local or open-source LLM

The demo focuses on one core idea:

> **The patient owns and controls access to their medical data.**

---

# Demo Scenario

A patient has recently moved from Pune to Bangalore and needs to visit a new doctor.

Instead of carrying physical files, sending reports through WhatsApp, or repeatedly explaining their medical history, the patient uses the Health Wallet PWA to securely share the required records with the doctor.

The demo will involve three views:

1. Patient PWA
2. Doctor/Hospital Portal
3. Local AI Health Summary

---

# Demo Flow

## Scene 1: The Problem

### What we say

> Imagine moving from Pune to Bangalore and visiting a new doctor. Your medical history is scattered across different hospitals, PDFs, WhatsApp chats, and physical files. The new doctor has no easy way to understand your health history, while you have very little control over who gets access to your sensitive information.

### What is shown

A simple visual representation of scattered medical information:

- Old hospital records
- Blood reports
- Prescriptions
- Medical PDFs
- Physical documents

### Transition

> What if your medical history travelled with you, while you remained in complete control of who could access it?

---

# Scene 2: Introducing the Health Wallet

The patient opens the Health Wallet PWA.

### Dashboard displays

## My Health Records

- Blood Test Report
- MRI Scan
- Prescription
- Vaccination Record
- Previous Consultation

Each record contains:

- Record type
- Healthcare provider
- Date
- Basic metadata

### What we say

> This is the patient's personal health wallet. Instead of medical records being scattered across institutions, the patient has one secure place to manage and control access to their health information.

---

# Scene 3: Doctor Requests Access

The patient visits a new doctor in Bangalore.

The doctor needs access to selected medical records.

### Patient action

The patient clicks:

## Share Medical Records

The patient selects:

### Healthcare Provider

Dr. Sharma - Bangalore

### Records to Share

- Blood Reports
- Previous Prescriptions
- Selected Consultation Notes

### Access Duration

- 30 Minutes
- 24 Hours
- 7 Days
- Until Revoked

For the demo, the patient selects:

> Selected medical records for 24 hours.

The system generates a secure QR code or access token.

---

# Scene 4: Doctor Accesses the Records

The doctor scans the QR code or opens the secure access portal.

The Doctor Portal displays only the records that the patient approved.

For example:

- Blood Test Report
- Previous Prescription
- Consultation Notes

The doctor does not automatically receive access to the patient's complete medical history.

### What we say

> Access is granular. The patient decides exactly what information is shared, with whom, and for how long.

---

# Scene 5: The Hero Moment - Access Revocation

The patient returns to the Health Wallet.

The dashboard shows:

## Active Access

**Dr. Sharma**

Access to:

- Blood Reports
- Prescriptions
- Consultation Notes

Status: Active

The patient clicks:

# REVOKE ACCESS

A confirmation appears:

> Access revoked successfully.

Immediately switch to the Doctor Portal.

The doctor's screen now displays:

# Access Revoked

> The patient has revoked access to these medical records.

### What we say

> The doctor does not permanently own access to the patient's medical data. The patient remains in control and can revoke access at any point.

This is the primary demonstration moment of the product.

---

# Scene 6: Access History

The patient opens:

## Access History

The application displays a log such as:

| Healthcare Provider | Records Accessed | Access Status |
|---|---|---|
| Dr. Sharma | Blood Reports and Prescriptions | Revoked |
| City Hospital | Full Medical History | Expired |
| Dr. Mehta | Vaccination Record | Active |

### What we say

> The patient can also see who has been granted access to their records and manage that access from one place.

---

# Scene 7: Local AI Health Summary

The patient has multiple medical records and reports.

Instead of manually reading every document, they click:

# Generate My Health Summary

A local or open-source LLM processes the available medical records and generates a concise summary.

### Example output

## Health Summary

- Previous Vitamin D deficiency recorded
- Recent blood test completed
- Current medications listed in prescription history
- No recorded allergies in available records
- Previous consultation notes summarized for a new healthcare provider

### What we say

> Medical records often contain years of scattered information. Our local AI layer helps turn those records into a concise and understandable health summary.

The key positioning:

> The AI can run locally using an open-source model, reducing the need to send highly sensitive medical information to an external AI service.

The AI feature supports the core product rather than becoming a separate health chatbot.

---

# Scene 8: Closing

Return to the main Health Wallet dashboard.

### Final message

> Medical records should be portable. Access should be temporary. Control should remain with the patient.

## Closing tagline

# Your Health. Your Data. Your Control.

---

# Core Features Demonstrated

## 1. Patient-Owned Medical Records

A single digital health wallet where patients can view and manage their records.

## 2. Granular Access Control

Patients decide:

- Who receives access
- Which records are shared
- How long access remains active

## 3. Instant Access Revocation

Patients can revoke access at any time.

The provider immediately loses access to the records.

## 4. Access History

Patients can view and manage previous and active access permissions.

## 5. Local AI Health Summary

A local or open-source LLM summarizes scattered medical records into a concise health overview.

---

# MVP Scope

The hackathon MVP should focus on making the following features work extremely well:

### Must Have

- Patient login or demo identity
- Health records dashboard
- Record details view
- Share records workflow
- Granular record selection
- Time-based access selection
- QR code or secure access link
- Doctor portal
- Real-time access validation
- Access revocation
- Access history

### If Time Permits

- Local/open-source LLM health summary
- OCR for uploaded medical documents
- Expiring access tokens
- Record categorization
- Emergency access workflow

---

# What We Are Not Building

To avoid scope creep, the MVP will not attempt to build:

- A nationwide hospital integration network
- Full interoperability with every healthcare provider
- A complete electronic health record system
- Medical diagnosis
- Disease prediction
- A general-purpose healthcare chatbot
- Complex diet and exercise recommendations

These can be positioned as future roadmap features.

---

# Demo Architecture

```text
                    PATIENT PWA
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
 Health Records    Consent Manager    Local AI
        |                |                |
        v                v                v
 Encrypted Data    Grant / Revoke    Open-source LLM
                         |
                         v
                   Access Token
                         |
                         v
                  DOCTOR PORTAL
                         |
                         v
                 Access Validation
                         |
              +----------+----------+
              |                     |
              v                     v
         Access Active         Access Revoked
         Show Records           Deny Access
```

---

# Key Demo Principle

The demo should not attempt to show every possible feature.

The focus should remain on one clear journey:

> **Patient moves to a new city -> Patient shares selected medical records with a new doctor -> Doctor accesses the records -> Patient revokes access -> Doctor immediately loses access -> Local AI summarizes the patient's medical history.**

If this journey works smoothly, the product will communicate its value clearly within a few minutes.

---

# Final Product Positioning

## A Patient-Owned Health Data Wallet

A privacy-first digital health platform that makes medical records portable while keeping access under the patient's control.

The patient decides:

> **Who sees their data. What they see. How long they see it. And when access ends.**

# Your Health. Your Data. Your Control.
