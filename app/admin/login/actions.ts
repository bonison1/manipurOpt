'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { resolveRole, HOME } from '@/lib/auth/resolve-home';

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

  const role = await resolveRole(supabase, data.user.email);

  if (role === 'admin') redirect(next);
  if (role === 'member') redirect(HOME.member);

  // Valid Supabase user, but neither admin nor member
  await supabase.auth.signOut();
  return { error: 'This account does not have access.' };
}

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}