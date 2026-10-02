import type { SupabaseClient } from '@supabase/supabase-js';
import { checkIsAdmin } from '@/lib/auth/is-admin';
import { createServiceClient } from '@/lib/supabase/server';

export type Role = 'admin' | 'member' | null;

export const HOME = {
  admin: '/admin',
  member: '/membership/dashboard',
} as const;

// Uses the service client so row-level security can't hide the member's own row.
async function checkIsMember(email?: string | null) {
  if (!email) return false;
  const { data } = await createServiceClient()
    .from('membership_applications')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  return !!data;
}

// Admin is checked first, so someone who is both lands on /admin.
export async function resolveRole(
  supabase: SupabaseClient,
  email?: string | null,
): Promise<Role> {
  if (await checkIsAdmin(supabase, email)) return 'admin';
  if (await checkIsMember(email)) return 'member';
  return null;
}