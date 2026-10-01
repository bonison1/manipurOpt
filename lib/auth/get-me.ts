import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { checkIsAdmin } from '@/lib/auth/is-admin';

export type Me = { role: 'admin' | 'member'; name: string } | null;

// Who is signed in right now? Reads the session cookie on the server.
export async function getMe(): Promise<Me> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email ?? '';
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  // Swap this for your own lookup (e.g. the application's full name) if you prefer
  const name = meta.full_name || meta.name || email.split('@')[0] || 'Member';

  const isAdmin = await checkIsAdmin(supabase, user.email);

  return { role: isAdmin ? 'admin' : 'member', name };
}