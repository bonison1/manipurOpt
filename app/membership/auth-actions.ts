// Path: app/membership/auth-actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';
import { signInWithDob } from './member-session';
import { clearApplySession } from './apply-session';

export type AuthState = { error?: string; success?: string } | undefined;

const clean = (v: unknown) => String(v ?? '').trim();

/* ------------------------------ Login ------------------------------ */
// The account is created automatically when step 1 of the application is saved, so there is
// no separate sign-up. Two ways in, both end on the dashboard:
//  • email + password (once the member has created one)
//  • email + date of birth (works before a password exists; the dashboard then asks for one)

export async function memberLogin(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const method = clean(formData.get('method')) === 'dob' ? 'dob' : 'password';
  const email = clean(formData.get('email')).toLowerCase();

  if (!email) return { error: 'Enter your email.' };

  if (method === 'dob') {
    const dob = clean(formData.get('date_of_birth'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return { error: 'Enter your date of birth.' };

    const result = await signInWithDob(email, dob);
    if (!result.ok) return { error: result.error };

    redirect('/membership/dashboard');
  }

  const password = String(formData.get('password') ?? '');
  if (!password) return { error: 'Enter your email and password.' };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === 'email_not_confirmed' || /confirm/i.test(error.message)) {
      return { error: 'Please confirm your email first. Check your inbox for the confirmation link.' };
    }
    return {
      error: 'Invalid email or password. If you have not created a password yet, log in with your date of birth.',
    };
  }

  redirect('/membership/dashboard');
}

/* ------------------------- Create password (dashboard popup) ------------------------- */

export async function createPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'Your session has ended. Please log in again.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error('create password failed:', error);
    return { error: error.message };
  }

  await createServiceClient()
    .from('membership_applications')
    .update({ password_set: true })
    .eq('email', user.email.toLowerCase());

  redirect('/membership/dashboard');
}

/* ------------------------------ Logout ------------------------------ */

export async function memberLogout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  await clearApplySession();
  redirect('/membership/login');
}