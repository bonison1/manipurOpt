// Path: lib/auth/require-admin.ts
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { checkIsAdmin } from '@/lib/auth/is-admin';

/**
 * Returns the signed-in admin user, or null if not signed in / not an admin.
 * Use in server actions and route handlers, where you want to return an
 * error instead of redirecting.
 */
export async function getAdminUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  if (!(await checkIsAdmin(supabase, user.email))) return null;

  return user;
}

/**
 * Boolean version of the check.
 * Use in pages that want to render notFound() for non-admins.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

/**
 * Same check, but redirects to the login page on failure.
 * Use in server components / pages that should send people to login.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}