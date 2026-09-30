// Path: app/admin/applications/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/auth/admin-client';
import { getAdminUser } from '@/lib/auth/require-admin';
import { APPLICATIONS_TABLE as T } from '@/lib/auth/config';

type R = { ok: boolean; error?: string };

// Membership approval (payment must already be verified)
export async function approveApplication(id: string): Promise<R> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized.' };
  const sb = createAdminClient();

  const { data: app } = await sb.from(T).select('payment_status').eq('id', id).maybeSingle();
  if (!app) return { ok: false, error: 'Application not found.' };
  if (app.payment_status !== 'paid') return { ok: false, error: 'Verify the payment first.' };

  const { error } = await sb
    .from(T)
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/applications');
  return error ? { ok: false, error: error.message } : { ok: true };
}

// The note is shown to the applicant on the tracking page ("Note from MOA")
export async function rejectApplication(id: string, note: string): Promise<R> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized.' };

  const { error } = await createAdminClient()
    .from(T)
    .update({ status: 'rejected', admin_notes: note || null, reviewed_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/applications');
  return error ? { ok: false, error: error.message } : { ok: true };
}