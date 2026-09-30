import { redirect } from 'next/navigation';
import { createSessionClient } from '@/lib/supabase/session';

export function isAllowedAdmin(email?: string | null) {
  const allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}

// Call at the top of every admin page AND every admin server action.
export async function requireAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdmin(user.email)) {
    redirect('/membership-admin/login');
  }
  return user;
}