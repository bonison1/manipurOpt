// Path: lib/auth/is-admin.ts
// Edge-safe: only imports a type. Works in middleware, server components and actions.
import type { SupabaseClient } from '@supabase/supabase-js';
import { isBootstrapAdmin } from './admin-emails';

// Pass a Supabase client that has the user's session (cookie-based client).
// RLS lets a signed-in user read only their own row in `admins`.
export async function checkIsAdmin(supabase: SupabaseClient, email?: string | null) {
  if (!email) return false;
  if (isBootstrapAdmin(email)) return true;

  const { data } = await supabase
    .from('admins')
    .select('email')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  return !!data;
}