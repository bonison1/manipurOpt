// Path: lib/auth/require-admin.ts
import { redirect } from 'next/navigation';
import { createSupabaseServer } from './supabase-server';

// ADMIN_EMAILS="a@gmail.com,b@gmail.com" in .env
export function isAdminEmail(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

// Returns the admin user, or null (use inside server actions)
export async function getAdminUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isAdminEmail(user.email) ? user : null;
}

// Use at the top of admin pages: redirects to the login page if not an admin
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}