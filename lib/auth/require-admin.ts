// Path: lib/auth/require-admin.ts
import { redirect } from 'next/navigation';
import { createSupabaseServer } from './supabase-server';
import { checkIsAdmin } from './is-admin';

// Returns the admin user, or null (use inside server actions)
export async function getAdminUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return (await checkIsAdmin(supabase, user.email)) ? user : null;
}

// Use at the top of admin pages: redirects to the login page if not an admin
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}