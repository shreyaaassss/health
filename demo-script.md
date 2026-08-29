# Inochi — Demo Video Script

**App:** Inochi Health Wallet  
**Duration:** ~4–5 minutes  
**Devices needed:** 2 phones (or 1 phone + 1 laptop)  
**Tagline:** *Your Health. Your Data. Your Control.*

---

## Setup Before Recording

- Patient device: logged in as patient (register a fresh account if needed)
- Doctor device: logged in as `doctor@healthwallet.demo` / `Demo@1234`
- Patient has at least 2–3 records (Blood Test, Prescription, etc.)
- Clear any old active access grants via `/demo/reset` if needed
- Both devices on the same WiFi or using the Vercel live URL

---

## Scene 1 — Opening: The Login Screen
**Duration:** 0:00 – 0:20  
**Device:** Patient phone  
**Show:** Login page — INOCHI logo, mountains background, white tagline

> *"This is Inochi — a patient-owned health data wallet.  
> Medical records that travel with you, securely, completely under your control."*

- Hold on the login screen for 3 seconds
- Enter credentials and log in

---

## Scene 2 — Patient Home Dashboard
**Duration:** 0:20 – 0:45  
**Device:** Patient phone  
**Show:** Home page with greeting, health ring, stats cards

> *"Every patient gets their own private health wallet.  
> The ring shows how complete your wallet is.  
> You can see your records, who has access right now, and book appointments — all in one place."*

- Scroll slowly: ring → stats → appointment card → Share CTA button

---

## Scene 3 — Adding a Medical Record
**Duration:** 0:45 – 1:15  
**Device:** Patient phone  
**Show:** Records tab → tap the "Add" button (top right)

- Fill in the form:
  - **Title:** Blood Test Report
  - **Type:** Lab Report
  - **Provider:** City Diagnostics
  - **Date:** today's date
  - **Description:** brief note
  - **Attach file:** (optional — upload a PDF or image)
- Tap **Save Record**
- **Show:** Green toast banner — *"Record saved successfully!"*
- App auto-redirects to the Records list

> *"Records are stored securely in your private wallet.  
> You can attach the actual report file — PDF, image, or document."*

---

## Scene 4 — Sharing Records with a Doctor
**Duration:** 1:15 – 2:00  
**Device:** Patient phone  
**Show:** Tap **Share** tab in bottom nav

- Records load automatically from the API
- Select: Blood Test Report + Prescription (tap to check)
- Choose duration: **1 Minute (Demo)** ← important for live timer demo
- Review screen — shows: *"Secure QR Code · Share this QR with your doctor"*
- Tap **Share Records**
- **Show:** QR code on screen + access link

> *"The patient decides exactly which records to share and for how long.  
> The QR code is a one-time secure token — it contains no medical data whatsoever."*

---

## Scene 5 — Doctor Scans the QR Code
**Duration:** 2:00 – 2:45  
**Device:** Switch to Doctor's device  
**Show:** Doctor dashboard — Dr. Arjun Sharma logged in

- Tap **Scan Patient QR Code** (blue button at top)
- Camera opens — scan the QR from the patient's phone
- Portal loads instantly:
  - *"Patient Medical Records"*
  - *"ACCESS ACTIVE · 0:52 remaining"* ← live timer
  - Amber watermark: *"CONFIDENTIAL · Viewed by Dr. Arjun Sharma · [timestamp]"*
- Tap **Blood Test Report** → record opens in detail sheet
- If PDF attached: tap **"View Document"** → PDF opens in browser

> *"The doctor sees only the records the patient chose to share.  
> There is a live countdown showing exactly how much time remains.  
> Every view is logged automatically. The doctor cannot download files."*

---

## Scene 6 — The Hero Moment: Instant Revocation
**Duration:** 2:45 – 3:15  
**Devices:** Both — this is the most impactful scene

**Patient device:**
- Go to **Access** tab
- Show: Dr. Arjun Sharma card with **ACTIVE** badge and live countdown timer
- Tap **Revoke Access** → confirmation sheet slides up
- Tap **Yes, Revoke Access**

**Switch to Doctor's device immediately — refresh the portal:**
- Red screen appears: 🚫 *"Access Revoked — The patient has revoked access to these medical records."*

> *"Revocation is instant. The moment the patient taps revoke,  
> the doctor loses access completely — no delay, no workaround, no appeal.  
> The patient is always in control."*

---

## Scene 7 — Access History & Audit Trail
**Duration:** 3:15 – 3:30  
**Device:** Patient phone  
**Show:** Tap **History** tab (or navigate from home)

- Tap on the grant card to expand it
- Show the full timeline:
  - ✓ ACCESS_GRANTED
  - 👁 Provider opened portal
  - 📄 Blood Test Report viewed
  - ✕ ACCESS_REVOKED by patient

> *"Every single action is recorded in an immutable audit trail.  
> The patient always knows exactly who accessed what, and when."*

---

## Scene 8 — Booking an Appointment
**Duration:** 3:30 – 3:50  
**Devices:** Both

**Patient device:**
- Tap **Book** tab → tap **Book** button
- Select: Dr. Arjun Sharma
- Reason: *"Follow-up consultation"*
- Preferred date: tomorrow
- Tap **Send Appointment Request**

**Doctor device:**
- Dashboard shows **1 Pending** (amber stat card)
- Tap the appointment request → **Confirm** → set date and time → confirm
- Appointment moves to **Upcoming** section with date banner

**Patient device:**
- Book tab refreshes → appointment shows **Confirmed** with date and time

> *"Two-way appointment booking. The patient requests, the doctor confirms.  
> Everything stays in sync in real time."*

---

## Scene 9 — Doctor Adds a Prescription
**Duration:** 3:50 – 4:20  
**Devices:** Both

**Doctor device:**
- Tap **Active Shares** stat card → Active Patients page
- Tap **View Records** on the patient card → portal opens
- Open Blood Test Report
- Tap **Add Prescription** (inside the record sheet)
- Fill in:
  - Medication: *Vitamin D3*
  - Dosage: *60,000 IU*
  - Frequency: *Once weekly*
  - Duration: *8 weeks*
- Tap **Save Prescription**
- Show confirmation: *"Prescription saved!"*

**Patient device:**
- Records tab → scroll down to *"Prescriptions from Doctors"* horizontal card section
- Show prescription card:
  - Vitamin D3 · 60,000 IU · Once weekly
  - ✦ *Signed by: Dr. Arjun Sharma*
  - **VERIFIED** badge
  - Date + time stamp

> *"Prescriptions are digitally signed at the moment of creation.  
> Timestamp is fixed — the prescription cannot be edited after one hour.  
> The patient sees it instantly in their health wallet."*

---

## Scene 10 — Closing Shot
**Duration:** 4:20 – 4:40  
**Device:** Patient phone  
**Show:** Home dashboard

- Pan across: ring → stats → records preview
- Hold on the INOCHI logo on the login screen for final frame

> *"Inochi gives patients complete ownership of their health data.  
> Doctors get secure, time-limited, revocable access.  
> Everything is logged, signed, and immutable.*  
>   
> *Your Health. Your Data. Your Control."*

---

## Key Talking Points Summary

| Feature | What to say |
|---|---|
| QR sharing | "Token only — no medical data in the link" |
| Live timer | "Doctor sees exactly how much time is left" |
| Instant revocation | "Instant — no delay, no workaround" |
| Audit trail | "Immutable log of every access event" |
| Prescription signature | "Digitally signed, timestamp-locked, verified" |
| No download for doctors | "View-only — doctors cannot save your files" |
| Confidential watermark | "If a screenshot is taken, it's traceable" |

---

## Pro Tips for Recording

1. **Mirror both screens** side-by-side during the revocation scene using [scrcpy](https://github.com/Genymobile/scrcpy) or phone's built-in screen cast — makes the instant revocation visually dramatic
2. **Use 1-Minute duration** when sharing so the countdown timer is visible and moves during recording
3. **Record in portrait** on the patient device (it's a PWA designed for mobile)
4. **Pre-fill the forms** slightly before recording so you're not typing slowly on camera — or use the autofill from the profile
5. **Demo reset** before each take: go to `[your-url]/demo/reset` to restore seed data and clear grants
