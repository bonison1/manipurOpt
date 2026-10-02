'use server';

// Path: app/membership/forgot-password.ts
// Email OTP password reset using Supabase's recovery flow.

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';

type Result = { error?: string; ok?: boolean };

const GENERIC_ERROR = 'Could not send the code right now. Please try again in a minute.';

export async function sendResetCode(emailInput: string): Promise<Result> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !email.includes('@')) return { error: 'Enter a valid email address.' };

  const db = createServiceClient();

  // Only act for emails that belong to an application or registration.
  const [{ data: app }, { data: reg }] = await Promise.all([
    db.from('membership_applications').select('email').eq('email', email).limit(1).maybeSingle(),
    db.from('registrations').select('email').eq('email', email).limit(1).maybeSingle(),
  ]);

  if (app || reg) {
    // Registration-only users may never have logged in, so they may have no auth account yet.
    // Create one if missing (an "already registered" error here is expected and ignored).
    await db.auth.admin.createUser({ email, email_confirm: true }).catch(() => null);

    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('forgot password: resetPasswordForEmail failed', error);
      return { error: GENERIC_ERROR };
    }
  }

  // Same response whether or not the email exists, so this can't be used to probe emails.
  return { ok: true };
}

export async function resetPasswordWithCode(input: {
  email: string;
  code: string;
  password: string;
  confirm: string;
}): Promise<Result> {
  const email = input.email.trim().toLowerCase();
  const code = input.code.replace(/\s+/g, '');

  if (!code) return { error: 'Enter the code from your email.' };
  if (input.password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (input.password !== input.confirm) return { error: 'Passwords do not match.' };

  const supabase = await createSupabaseServer();

  // 1) Verify the code (this also signs the user in)
  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
  if (verifyError) return { error: 'That code is invalid or has expired. Request a new one.' };

  // 2) Set the new password
  const { error: updateError } = await supabase.auth.updateUser({ password: input.password });
  if (updateError) return { error: updateError.message };

  // 3) Mark the password as set so the "create password" prompt stops showing
  const db = createServiceClient();
  await Promise.all([
    db.from('membership_applications').update({ password_set: true }).eq('email', email),
    db.from('registrations').update({ password_set: true }).eq('email', email),
  ]);

  redirect('/membership/dashboard');
}