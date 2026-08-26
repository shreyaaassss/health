# LLM Feature

## Feature Name

# Private Health Intelligence

## Overview

The application uses a local or open-source Large Language Model (LLM) to help patients understand and organize their medical history.

The purpose of the LLM is not to diagnose diseases or replace a doctor.

Instead, it acts as a **private medical record intelligence layer** that can read the patient's available records and convert scattered medical information into a concise, structured, and easy-to-understand summary.

The core principle is:

> **The AI helps understand the patient's data without taking control of it.**

---

# The Problem

A patient may have medical records spread across multiple years and healthcare providers.

These records can include:

- Blood test reports
- Prescriptions
- Consultation notes
- MRI or scan reports
- Vaccination records
- Discharge summaries

When a patient visits a new doctor, they may need to manually search through multiple documents to explain their medical history.

The doctor may also need time to understand which information is relevant.

The LLM feature solves this by creating a structured summary from the records that the patient has chosen to include.

---

# How the LLM Is Used

The patient opens their Health Wallet and clicks:

## Generate My Health Summary

The application gathers the medical records selected by the patient.

These records are processed by a local or open-source LLM.

The LLM then extracts and organizes important information into a structured summary.

For example:

```text
HEALTH SUMMARY

Relevant Medical History
- Previous Vitamin D deficiency recorded
- History of recurring stomach discomfort mentioned in consultation notes

Recent Tests
- Blood test completed in March 2026
- Vitamin D levels were below the reference range in a previous report

Medications
- Current and previous medications extracted from available prescriptions

Allergies
- No allergies recorded in the available medical documents

Recent Consultations
- Previous consultation notes summarized chronologically
```

The user can then use this summary to better understand their own medical history or share it with a new healthcare provider.

---

# Core Feature Flow

```text
Patient Medical Records
        |
        v
User Selects Records
        |
        v
Text Extraction / Record Processing
        |
        v
Local or Open-Source LLM
        |
        v
Structured Medical Summary
        |
        +----------------------+
        |                      |
        v                      v
 Patient View             Optional Sharing
```

The patient remains in control at every step.

The LLM only processes records that the user has selected or authorized for analysis.

---

# Demo Flow

## Step 1: Patient Has Multiple Records

The Health Wallet contains:

- Blood Test Report
- Prescription
- Previous Consultation
- MRI Report
- Vaccination Record

The information is spread across different documents and dates.

---

## Step 2: Generate Health Summary

The patient clicks:

# Generate My Health Summary

The application sends the selected record content to the local or open-source LLM.

A loading state is shown:

> Analyzing your selected health records...

---

## Step 3: Structured Summary Is Generated

The LLM organizes the information into categories:

### Medical History

Important historical observations mentioned in the available records.

### Recent Tests

A concise overview of recent laboratory tests or investigations.

### Medications

Medications extracted from available prescriptions.

### Allergies

Recorded allergies, if present in the selected records.

### Previous Consultations

Important context extracted from consultation notes.

### Timeline

A chronological overview of the patient's available medical history.

---

# Example Demo Interaction

The patient selects several records and asks:

> What should I know before visiting a new doctor?

The local AI generates:

> Based on your selected medical records, your history includes a previous Vitamin D deficiency and multiple consultations related to stomach discomfort. Your most recent available blood test was completed in March 2026. The summary is generated only from the records currently available in your Health Wallet.

The application should clearly display:

> This is a summary of your available medical records and is not a medical diagnosis.

This keeps the feature focused on information organization rather than clinical decision-making.

---

# Why Use a Local or Open-Source LLM?

Medical records contain highly sensitive personal information.

A traditional cloud AI workflow could require sending document content to an external AI service for processing.

The proposed architecture aims to reduce that dependency by using a local or open-source model where feasible.

The feature can therefore be positioned as:

## Privacy-First Medical Record Intelligence

The system attempts to process sensitive health information closer to the user's device rather than making an external AI service the default destination for every record.

This directly supports the product's larger philosophy:

> **The patient owns the data, and the intelligence layer should respect that ownership.**

---

# Local LLM Architecture

```text
                 HEALTH WALLET PWA
                          |
                          v
                 Selected Medical Records
                          |
                          v
                 Text / Data Extraction
                          |
                          v
              Local or Open-Source LLM
                          |
                          v
                 Structured AI Output
                          |
        +-----------------+------------------+
        |                                    |
        v                                    v
  Health Summary                       Medical Timeline
        |
        v
   Patient Review
```

For the hackathon, the LLM can focus on processing preloaded or selected sample records to demonstrate the experience reliably.

---

# Potential Model Responsibilities

The LLM can perform the following tasks:

## 1. Medical Record Summarization

Convert multiple documents into a concise patient-readable summary.

Example:

> Summarize the most important information from my selected medical records.

---

## 2. Medical Timeline Generation

Organize available records chronologically.

Example:

```text
2024
- Blood test completed

2025
- Vitamin D deficiency recorded
- Prescription issued

2026
- Follow-up blood test
- Recent consultation
```

---

## 3. New Doctor Brief

Generate a concise summary that a patient can present to a new healthcare provider.

Example sections:

- Relevant history
- Recent tests
- Current medications
- Recorded allergies
- Recent consultations

---

## 4. Document Simplification

Help the patient understand complex medical language already present in their records.

For example:

> Explain this report in simpler language.

The application should keep the explanation tied to the content of the selected record and avoid presenting the output as a medical diagnosis.

---

# Optional Feature: Questions About Records

The user could ask questions such as:

> What medications are mentioned across my prescriptions?

> When was my last blood test?

> What health issues have been mentioned in my previous consultation notes?

The LLM searches and summarizes information from the records selected by the user.

The key distinction is:

> The AI answers based on the patient's records rather than inventing or diagnosing new medical conditions.

---

# Privacy and User Control

The LLM feature should follow the same control model as the rest of the application.

The patient decides:

- Which records are analyzed
- When the analysis happens
- Whether the generated summary is stored
- Whether the summary is shared with a healthcare provider

The AI does not automatically gain access to every medical record.

Instead:

```text
Patient Selects Records
        |
        v
Patient Requests Analysis
        |
        v
LLM Processes Authorized Data
        |
        v
Summary Generated
        |
        v
Patient Reviews Output
```

---

# What the LLM Will Not Do

For the MVP, the LLM should not be positioned as:

- A replacement for a doctor
- A disease diagnosis engine
- An emergency medical decision system
- A prescription generator
- An autonomous healthcare agent

The feature exists to:

> **Organize, summarize, and explain information that already exists in the patient's medical records.**

This keeps the feature aligned with the main purpose of the product.

---

# Why This Feature Strengthens the Product

Without the LLM, the Health Wallet solves the problem of:

> **Where are my medical records?**

With the LLM, it also helps answer:

> **What is actually important in my medical history?**

The combination creates two layers:

## Layer 1: Ownership

The patient securely manages and controls access to medical records.

## Layer 2: Intelligence

The local or open-source LLM helps transform scattered medical records into understandable and useful information.

Together:

```text
          MEDICAL RECORDS
                 |
        +--------+--------+
        |                 |
        v                 v
     OWNERSHIP        INTELLIGENCE
        |                 |
        v                 v
 Grant / Revoke      Local LLM Analysis
        |                 |
        +--------+--------+
                 |
                 v
          PATIENT CONTROL
```

---

# Hackathon Positioning

The local LLM should not feel like an unrelated AI feature added only to gain extra points.

Instead, it should strengthen the core idea.

The product story becomes:

> **We give patients ownership over their medical data. Then, instead of leaving them with a folder full of unreadable reports, we use local AI to help them understand and organize the information they already own.**

This creates a direct connection between:

- Patient ownership
- Privacy
- Portable medical records
- On-device or local AI
- The phone-first experience

---

# MVP Implementation Priority

## Priority 1: Core Product

The following must work first:

- Health records dashboard
- Record sharing
- Granular permissions
- Access duration
- Doctor portal
- Access revocation

## Priority 2: LLM Demo

Once the core product works, add:

- Select records
- Generate health summary
- Display structured output

## Priority 3: Advanced Features

Only if time permits:

- Medical timeline
- Questions about records
- Simplification of medical language
- Local document OCR
- Multi-document comparison

---

# Final Feature Statement

## Private Health Intelligence

A local AI layer that transforms scattered medical records into a concise, structured health summary while keeping the patient in control of what information is analyzed.

> **Your records remain yours. Your AI understands only what you choose to share with it.**
