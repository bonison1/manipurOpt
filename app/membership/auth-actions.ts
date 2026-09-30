// Path: app/membership/auth-actions.ts
'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; success?: string } | undefined;

const clean = (v: unknown) => String(v ?? '').trim();

/* ------------------------------ Login ------------------------------ */

export async function memberLogin(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get('email')).toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === 'email_not_confirmed' || /confirm/i.test(error.message)) {
      return { error: 'Please confirm your email first. Check your inbox for the confirmation link.' };
    }
    return { error: 'Invalid email or password.' };
  }

  redirect('/membership/dashboard');
}

/* ------------------------------ Sign up ------------------------------ */
// Only people who already applied can create an account: registration number + email
// must match an application. The dashboard then finds the application by the
// (confirmed) email of the logged-in user.

export async function memberSignup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const applicationNo = clean(formData.get('application_no')).toUpperCase();
  const email = clean(formData.get('email')).toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (!applicationNo) return { error: 'Enter your registration number.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const { data: app, error: appError } = await createServiceClient()
    .from('membership_applications')
    .select('id')
    .eq('application_no', applicationNo)
    .eq('email', email)
    .maybeSingle();

  if (appError) {
    console.error('signup lookup failed:', appError);
    return { error: 'Could not verify your application. Please try again.' };
  }
  if (!app) {
    return {
      error:
        'No application found for that registration number and email. Use the email you applied with, or apply for membership first.',
    };
  }

  const h = await headers();
  const origin = h.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/membership/auth/callback?next=/membership/dashboard` },
  });

  if (error) {
    if (/registered|already/i.test(error.message)) {
      return { error: 'An account with this email already exists. Please log in.' };
    }
    console.error('signup failed:', error);
    return { error: error.message };
  }

  // With email confirmation on, an existing address comes back with no identities
  if (data.user && data.user.identities?.length === 0) {
    return { error: 'An account with this email already exists. Please log in.' };
  }

  // Email confirmation switched off in Supabase: user is already signed in
  if (data.session) redirect('/membership/dashboard');

  return { success: `Account created. We sent a confirmation link to ${email}. Click it, then log in.` };
}

/* ------------------------------ Logout ------------------------------ */

export async function memberLogout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/membership/login');
}