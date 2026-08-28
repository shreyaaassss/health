-- Link prescriptions to specific medical records (ON DELETE CASCADE)
ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS medical_record_id UUID
    REFERENCES medical_records(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_prescriptions_record ON prescriptions(medical_record_id);
