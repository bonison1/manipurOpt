'use server';

// Path: app/membership/dashboard/registration-password.ts

import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';

type State = { error?: string; ok?: boolean } | undefined;

export async function setRegistrationPassword(_prev: State, formData: FormData): Promise<State> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'Your session has expired. Please log in again.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  const db = createServiceClient();
  const { error: flagError } = await db
    .from('registrations')
    .update({ password_set: true })
    .eq('email', user.email.toLowerCase());
  if (flagError) console.error('registration password flag failed:', flagError);

  return { ok: true };
}