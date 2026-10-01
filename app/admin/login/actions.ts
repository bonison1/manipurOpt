// Path: app/admin/login/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { checkIsAdmin } from '@/lib/auth/is-admin';

// Only allow redirects to pages inside /admin (prevents open redirects).
function safeNext(value: string) {
  const inAdmin = value === '/admin' || value.startsWith('/admin/');
  const isLogin = value.startsWith('/admin/login');
  return inAdmin && !isLogin ? value : '/admin';
}

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(String(formData.get('next') ?? ''));

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) return { error: 'Invalid email or password.' };

  if (!(await checkIsAdmin(supabase, data.user.email))) {
    await supabase.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }

  redirect(next);
}

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}