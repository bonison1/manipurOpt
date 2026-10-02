'use server';

// Path: app/membership/reference-login.ts
// Wraps the existing memberLogin: password / date-of-birth logins go through it unchanged,
// the new "reference" method (email + reference number) is handled here.

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveRole } from '@/lib/auth/resolve-home';
import { memberLogin } from './auth-actions';

type LoginState = { error?: string } | undefined;

const NO_MATCH = 'We could not find a match. Check your email and reference number.';

export async function memberLoginAny(prev: LoginState, formData: FormData): Promise<LoginState> {
  if (String(formData.get('method') ?? '') !== 'reference') {
    return (memberLogin as unknown as (p: LoginState, f: FormData) => Promise<LoginState>)(prev, formData);
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const ref = String(formData.get('reference_no') ?? '').trim().toUpperCase();
  if (!email || !ref) return { error: 'Enter your email and reference number.' };

  const db = createServiceClient();

  // 1) Email + reference must belong to the same record (membership or registration)
  const isMembership = ref.split('-')[0] === 'MOA';
  const { data: match } = isMembership
    ? await db
        .from('membership_applications')
        .select('application_no')
        .eq('application_no', ref)
        .eq('email', email)
        .maybeSingle()
    : await db
        .from('registrations')
        .select('reference_no')
        .eq('reference_no', ref)
        .eq('email', email)
        .maybeSingle();
  if (!match) return { error: NO_MATCH };

  // 2) Registration forms never verify email ownership, so never let this path
  //    open a staff/admin account that happens to share the typed email.
  const role = await resolveRole(db, email);
  if (role && role !== 'member') return { error: NO_MATCH };

  // 3) Create a session for that email (no email is sent)
  const { data: link, error: linkError } = await db.auth.admin.generateLink({ type: 'magiclink', email });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error('reference login: generateLink failed', linkError);
    return { error: 'Could not sign you in right now. Please try again.' };
  }

  const supabase = await createSupabaseServer();
  const { error: otpError } = await supabase.auth.verifyOtp({ type: 'magiclink', token_hash: tokenHash });
  if (otpError) {
    console.error('reference login: verifyOtp failed', otpError);
    return { error: 'Could not sign you in right now. Please try again.' };
  }

  redirect('/membership/dashboard');
}