-- Path: db/membership_v3_password.sql
-- Tracks whether the member has created a password (drives the dashboard "Create password" popup).
ALTER TABLE membership_applications
  ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT false;

-- One-time backfill. Run it ONCE, BEFORE deploying this version.
-- Login accounts that already exist were created with the old sign-up form, so they already chose a password.
-- (If you run it after the new code has auto-created accounts, those members would wrongly be marked as having one.)
UPDATE membership_applications m
SET password_set = true
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE lower(u.email) = lower(m.email));
