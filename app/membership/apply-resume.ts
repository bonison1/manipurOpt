// Path: app/membership/apply-resume.ts
// Shared "email + date of birth" verification (with lockout after repeated failures).
// NOT a server action file, so nothing here can be called from the browser.
import { createServiceClient } from '@/lib/supabase/server';
import { setApplySession } from './apply-session';

const TABLE = 'membership_applications';
const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export const NOT_FOUND_MESSAGE =
  'We could not find an application with that email and date of birth. Check them and try again.';

// Flat type on purpose: boolean-discriminated unions don't narrow when `strictNullChecks` is off.
export type DobCheck = { ok: boolean; error?: string; id?: string; isDraft?: boolean };

/** Checks email + date of birth against an application. `draftOnly` limits it to unfinished ones. */
export async function verifyDob(email: string, dob: string, opts: { draftOnly?: boolean } = {}): Promise<DobCheck> {
  const db = createServiceClient();

  let query = db
    .from(TABLE)
    .select('id, date_of_birth, is_draft, resume_failed_attempts, resume_locked_until')
    .eq('email', email);
  if (opts.draftOnly) query = query.eq('is_draft', true);

  const { data: app } = await query.maybeSingle();
  if (!app) return { ok: false, error: NOT_FOUND_MESSAGE };

  if (app.resume_locked_until && new Date(app.resume_locked_until) > new Date()) {
    return { ok: false, error: `Too many attempts. Please wait ${LOCK_MINUTES} minutes and try again.` };
  }

  if (String(app.date_of_birth) !== dob) {
    const attempts = Number(app.resume_failed_attempts ?? 0) + 1;
    await db
      .from(TABLE)
      .update(
        attempts >= MAX_ATTEMPTS
          ? {
              resume_failed_attempts: 0,
              resume_locked_until: new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString(),
            }
          : { resume_failed_attempts: attempts }
      )
      .eq('id', app.id);
    return { ok: false, error: NOT_FOUND_MESSAGE };
  }

  await db.from(TABLE).update({ resume_failed_attempts: 0, resume_locked_until: null }).eq('id', app.id);
  return { ok: true, id: app.id, isDraft: !!app.is_draft };
}

/** Used by /membership/apply/resume: verify, then remember the draft in the signed cookie. */
export async function startDraftSession(email: string, dob: string) {
  const check = await verifyDob(email, dob, { draftOnly: true });
  if (check.ok && check.id) await setApplySession(check.id);
  return check;
}
