// Path: app/admin/login/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { isAdminEmail } from '@/lib/auth/require-admin';

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) return { error: 'Invalid email or password.' };

  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }

  redirect('/admin');
}

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}