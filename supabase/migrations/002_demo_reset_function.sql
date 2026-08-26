-- ═══════════════════════════════════════════════════════════════
--  Demo Reset Function
--  Phase 12: Clears all access grants, tokens, and logs
--  Restores demo patient, providers, and seed records to clean state.
--  Called by /api/demo/reset endpoint.
-- ═══════════════════════════════════════════════════════════════

create or replace function reset_demo_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Clear all access-related data (cascade handles child rows)
  delete from access_logs;
  delete from access_grant_records;
  delete from access_tokens;
  delete from access_grants;

  -- Reset medical records to original seed state
  delete from medical_records
  where patient_id = '00000000-0000-0000-0000-000000000001';

  insert into medical_records (id, patient_id, title, type, provider_name, record_date, description) values
    (
      '00000000-0000-0000-0002-000000000001',
      '00000000-0000-0000-0000-000000000001',
      'Blood Test Report',
      'lab_report',
      'City Diagnostics',
      '2026-03-15',
      'Complete blood count and metabolic panel. Vitamin D levels below reference range (18 ng/mL, normal: 30–100 ng/mL). All other parameters within normal range.'
    ),
    (
      '00000000-0000-0000-0002-000000000002',
      '00000000-0000-0000-0000-000000000001',
      'MRI Scan — Lumbar Spine',
      'imaging',
      'Pune Diagnostics',
      '2026-01-10',
      'MRI of lumbar spine (L4–L5). Mild disc bulge noted at L4-L5, no significant neural compression. No fractures or lesions detected.'
    ),
    (
      '00000000-0000-0000-0002-000000000003',
      '00000000-0000-0000-0000-000000000001',
      'Prescription — Vitamin D & Calcium',
      'prescription',
      'Dr. Meena Mehta',
      '2026-02-20',
      'Vitamin D3 60,000 IU weekly for 8 weeks. Calcium Carbonate 500mg twice daily. Review after 3 months.'
    ),
    (
      '00000000-0000-0000-0002-000000000004',
      '00000000-0000-0000-0000-000000000001',
      'Vaccination Record',
      'vaccination',
      'Pune City Hospital',
      '2025-09-05',
      'COVID-19 booster administered (Covishield). Influenza vaccine administered. All vaccinations up to date as of September 2025.'
    ),
    (
      '00000000-0000-0000-0002-000000000005',
      '00000000-0000-0000-0000-000000000001',
      'Consultation Notes — General Checkup',
      'consultation',
      'Dr. Meena Mehta',
      '2026-02-20',
      'Patient presented with fatigue and mild back discomfort. History of recurring stomach discomfort over past 6 months. No allergies recorded. Referred for blood work and MRI. Follow-up in 3 months.'
    )
  on conflict do nothing;
end;
$$;
