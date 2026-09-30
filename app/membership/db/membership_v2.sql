-- Path: db/membership_v2.sql   (run once in the Supabase SQL editor)
-- Assumes PostgreSQL / Supabase and a table named membership_applications.
-- This REPLACES the earlier migration: payment works like the original (QR + proof upload),
-- so the payment_date / payment_account_name / transaction_id / receipt columns are gone.

-- 1) New columns -------------------------------------------------------------
ALTER TABLE membership_applications
  -- personal & work
  ADD COLUMN IF NOT EXISTS gender                      text,
  ADD COLUMN IF NOT EXISTS city                        text,
  ADD COLUMN IF NOT EXISTS state                       text,
  ADD COLUMN IF NOT EXISTS pin_code                    varchar(6),
  ADD COLUMN IF NOT EXISTS country                     text DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS aadhaar                     varchar(12),
  ADD COLUMN IF NOT EXISTS voter_id                    text,
  ADD COLUMN IF NOT EXISTS current_working_details     text,
  ADD COLUMN IF NOT EXISTS is_independent_practitioner boolean,

  -- education
  ADD COLUMN IF NOT EXISTS bo_university               text,
  ADD COLUMN IF NOT EXISTS bo_college                  text,
  ADD COLUMN IF NOT EXISTS college_address             text,
  ADD COLUMN IF NOT EXISTS bo_completion_date          date,
  ADD COLUMN IF NOT EXISTS highest_qualification       text,

  -- documents (storage path inside the private 'membership-docs' bucket)
  ADD COLUMN IF NOT EXISTS documents_path              text,
  ADD COLUMN IF NOT EXISTS documents_name              text,

  -- draft / resume support
  ADD COLUMN IF NOT EXISTS is_draft                    boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS draft_step                  smallint    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS submitted_at                timestamptz,
  ADD COLUMN IF NOT EXISTS resume_failed_attempts      smallint    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS resume_locked_until         timestamptz;

-- Existing rows were all fully submitted, so is_draft = false (the default) is correct.

-- 2) A draft only has step-1 data, so columns filled by later steps must allow NULL.
--    (Safe to run even if a column is already nullable.)
ALTER TABLE membership_applications
  ALTER COLUMN address              DROP NOT NULL,
  ALTER COLUMN district             DROP NOT NULL,
  ALTER COLUMN qualification        DROP NOT NULL,
  ALTER COLUMN institution          DROP NOT NULL,
  ALTER COLUMN membership_category  DROP NOT NULL,
  ALTER COLUMN declaration_accepted DROP NOT NULL,
  ALTER COLUMN fee_amount           DROP NOT NULL;

-- 3) Data-quality constraints (re-runnable) ------------------------------------
ALTER TABLE membership_applications
  DROP CONSTRAINT IF EXISTS chk_gender,
  DROP CONSTRAINT IF EXISTS chk_pin_code,
  DROP CONSTRAINT IF EXISTS chk_aadhaar,
  DROP CONSTRAINT IF EXISTS chk_highest_qualification;

ALTER TABLE membership_applications
  ADD CONSTRAINT chk_gender CHECK (gender IN ('Male', 'Female', 'Other')),
  ADD CONSTRAINT chk_pin_code CHECK (pin_code ~ '^[0-9]{6}$'),
  ADD CONSTRAINT chk_aadhaar CHECK (aadhaar ~ '^[0-9]{12}$'),
  ADD CONSTRAINT chk_highest_qualification
    CHECK (highest_qualification IN ('B.Optom', 'M.Optom', 'PhD-Optometry', 'Others'));

-- One application per Aadhaar number
CREATE UNIQUE INDEX IF NOT EXISTS uq_membership_aadhaar
  ON membership_applications (aadhaar) WHERE aadhaar IS NOT NULL;

-- Fast lookup for "continue application" (email + is_draft)
CREATE INDEX IF NOT EXISTS idx_membership_email_draft
  ON membership_applications (email, is_draft);

-- 4) Private storage bucket for the single documents PDF (10 MB, PDF only) --------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('membership-docs', 'membership-docs', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5) OPTIONAL clean-up: only if you ran the FIRST migration I gave you earlier ------
-- ALTER TABLE membership_applications
--   DROP COLUMN IF EXISTS payment_date,
--   DROP COLUMN IF EXISTS payment_account_name,
--   DROP COLUMN IF EXISTS transaction_id,
--   DROP COLUMN IF EXISTS documents_url,
--   DROP COLUMN IF EXISTS receipt_url;
-- DROP INDEX IF EXISTS uq_membership_transaction_id;

-- 6) IMPORTANT for your admin pages: unfinished applications are stored in this same
--    table with is_draft = true. Add  .eq('is_draft', false)  to every admin list/count
--    query so drafts do not show up as real applications.
