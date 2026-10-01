// Path: app/membership/member-session.ts
// Creates the member's login account when step 1 is saved, and signs a member in with
// email + date of birth. NOT a server action file (cannot be called from the browser).
import { randomBytes } from 'crypto';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyDob, type DobCheck } from './apply-resume';

/** Makes sure a Supabase Auth user exists for this email. The account starts with a random
 *  password nobody knows; the member sets a real one from the dashboard popup.
 *  Safe to call repeatedly. Returns false only on an unexpected failure. */
export async function ensureAuthUser(email: string): Promise<boolean> {
  const { error } = await createServiceClient().auth.admin.createUser({
    email,
    password: randomBytes(32).toString('base64url'),
    email_confirm: true,
  });

  if (!error) return true;
  if (error.code === 'email_exists' || /already|registered/i.test(error.message)) return true;

  console.error('ensureAuthUser failed:', error);
  return false;
}

/** Email + date of birth -> a real Supabase session (same as a password login). */
export async function signInWithDob(email: string, dob: string): Promise<DobCheck> {
  const check = await verifyDob(email, dob);
  if (!check.ok) return check;

  const failed: DobCheck = { ok: false, error: 'Could not sign you in right now. Please try again.' };

  // Applications saved before this change may not have a login account yet
  if (!(await ensureAuthUser(email))) return failed;

  // Server-side magic link: no email is sent, we redeem the token straight away
  const { data, error } = await createServiceClient().auth.admin.generateLink({ type: 'magiclink', email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    console.error('generateLink failed:', error);
    return failed;
  }

  const supabase = await createSupabaseServer();
  const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' });
  if (verifyError) {
    console.error('verifyOtp failed:', verifyError);
    return failed;
  }

  return check;
}
