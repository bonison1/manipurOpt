// Path: app/admin/admins/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { isBootstrapAdmin } from '@/lib/auth/admin-emails';

export type AdminFormState = { error?: string; success?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function addAdmin(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const me = await getAdminUser();
  if (!me) return { error: 'You are not authorised to do this.' };

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
  if (password && password.length < 8) {
    return { error: 'Temporary password must be at least 8 characters.' };
  }
  if (isBootstrapAdmin(email)) return { error: 'This email is already an owner admin.' };

  const admin = createAdminClient();
  let accountCreated = false;

  // Optionally create the login account (email pre-confirmed).
  if (password) {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error && !/already|registered|exists/i.test(error.message)) {
      return { error: error.message };
    }
    accountCreated = !error;
  }

  const { error: insertError } = await admin
    .from('admins')
    .upsert(
      { email, added_by: me.email?.toLowerCase() ?? null },
      { onConflict: 'email', ignoreDuplicates: true },
    );
  if (insertError) return { error: 'Could not add admin. Please try again.' };

  revalidatePath('/admin/admins');

  if (password && !accountCreated) {
    return {
      success: `${email} added as admin. They already have an account, so their existing password still applies.`,
    };
  }
  return {
    success: password
      ? `${email} added as admin with the temporary password you set.`
      : `${email} added as admin. They need an existing account (or a password reset) to sign in.`,
  };
}

export async function removeAdmin(formData: FormData): Promise<void> {
  const me = await getAdminUser();
  if (!me) return;

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return;
  if (email === me.email?.toLowerCase()) return; // cannot remove yourself
  if (isBootstrapAdmin(email)) return; // owners are managed via env

  const admin = createAdminClient();
  await admin.from('admins').delete().eq('email', email);

  revalidatePath('/admin/admins');
}