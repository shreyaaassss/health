-- Fix reset_demo_data(): scope all DELETEs to the demo patient
-- to satisfy Supabase's "DELETE requires a WHERE clause" safety guard.

create or replace function reset_demo_data()
returns void
language plpgsql
security definer
as $$
declare
  v_patient_id uuid := '00000000-0000-0000-0000-000000000001';
begin
  -- Delete logs scoped to demo patient
  delete from access_logs
  where patient_id = v_patient_id;

  -- Delete grant records scoped to demo patient's grants
  delete from access_grant_records
  where access_grant_id in (
    select id from access_grants where patient_id = v_patient_id
  );

  -- Delete tokens scoped to demo patient's grants
  delete from access_tokens
  where access_grant_id in (
    select id from access_grants where patient_id = v_patient_id
  );

  -- Delete grants for demo patient
  delete from access_grants
  where patient_id = v_patient_id;

  -- Restore seed medical records
  delete from medical_records where patient_id = v_patient_id;

  insert into medical_records (id, patient_id, title, type, provider_name, record_date, description) values
    (
      '00000000-0000-0000-0002-000000000001', v_patient_id,
      'Blood Test Report', 'lab_report', 'City Diagnostics', '2026-03-15',
      'Complete blood count and metabolic panel. Vitamin D levels below reference range (18 ng/mL, normal: 30–100 ng/mL). All other parameters within normal range.'
    ),
    (
      '00000000-0000-0000-0002-000000000002', v_patient_id,
      'MRI Scan — Lumbar Spine', 'imaging', 'Pune Diagnostics', '2026-01-10',
      'MRI of lumbar spine (L4–L5). Mild disc bulge noted at L4-L5, no significant neural compression. No fractures or lesions detected.'
    ),
    (
      '00000000-0000-0000-0002-000000000003', v_patient_id,
      'Prescription — Vitamin D & Calcium', 'prescription', 'Dr. Meena Mehta', '2026-02-20',
      'Vitamin D3 60,000 IU weekly for 8 weeks. Calcium Carbonate 500mg twice daily. Review after 3 months.'
    ),
    (
      '00000000-0000-0000-0002-000000000004', v_patient_id,
      'Vaccination Record', 'vaccination', 'Pune City Hospital', '2025-09-05',
      'COVID-19 booster administered (Covishield). Influenza vaccine administered. All vaccinations up to date as of September 2025.'
    ),
    (
      '00000000-0000-0000-0002-000000000005', v_patient_id,
      'Consultation Notes — General Checkup', 'consultation', 'Dr. Meena Mehta', '2026-02-20',
      'Patient presented with fatigue and mild back discomfort. History of recurring stomach discomfort over past 6 months. No allergies recorded. Referred for blood work and MRI. Follow-up in 3 months.'
    )
  on conflict (id) do update set
    title        = excluded.title,
    type         = excluded.type,
    provider_name = excluded.provider_name,
    record_date  = excluded.record_date,
    description  = excluded.description;
end;
$$;
