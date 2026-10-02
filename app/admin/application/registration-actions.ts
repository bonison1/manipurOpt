'use server';

// Path: app/admin/application/registration-actions.ts
// Admin actions for institute / student / clinic registrations (the `registrations` table).
// Membership applications keep using ./actions and payment-actions unchanged.

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/auth/admin-client';
import { getAdminUser } from '@/lib/auth/require-admin';
import { approveProof, rejectProof } from '@/app/membership/payment-actions';

type R = { ok: boolean; error?: string };

const TABLE = 'registrations';

function refresh() {
  revalidatePath('/admin/application');
  revalidatePath('/admin/applications');
}

// Verify the uploaded payment proof -> registration becomes "paid"
export async function approveRegistrationProof(proofId: string, referenceNo: string): Promise<R> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized.' };
  const sb = createAdminClient();

  // The shared handler may only know membership applications, so ignore its result and
  // make sure both sides are updated here (idempotent if it already did the work).
  await approveProof(proofId).catch(() => null);

  const { error: proofError } = await sb.from('payment_proofs').update({ status: 'approved' }).eq('id', proofId);
  if (proofError) return { ok: false, error: proofError.message };

  const { error } = await sb.from(TABLE).update({ payment_status: 'paid' }).eq('reference_no', referenceNo);
  refresh();
  return error ? { ok: false, error: error.message } : { ok: true };
}

// The note is shown to the registrant on the tracking page / dashboard
export async function rejectRegistrationProof(proofId: string, note: string): Promise<R> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized.' };

  await rejectProof(proofId, note).catch(() => null);

  const { error } = await createAdminClient()
    .from('payment_proofs')
    .update({ status: 'rejected', reviewer_note: note || null })
    .eq('id', proofId);

  refresh();
  return error ? { ok: false, error: error.message } : { ok: true };
}

// Final approval (payment must already be verified). The DB trigger then issues certificate_no.
export async function approveRegistration(referenceNo: string): Promise<R> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized.' };
  const sb = createAdminClient();

  const { data: reg } = await sb.from(TABLE).select('payment_status').eq('reference_no', referenceNo).maybeSingle();
  if (!reg) return { ok: false, error: 'Registration not found.' };
  if (reg.payment_status !== 'paid') return { ok: false, error: 'Verify the payment first.' };

  const { error } = await sb
    .from(TABLE)
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('reference_no', referenceNo);

  refresh();
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function rejectRegistration(referenceNo: string, note: string): Promise<R> {
  if (!(await getAdminUser())) return { ok: false, error: 'Not authorized.' };

  const { error } = await createAdminClient()
    .from(TABLE)
    .update({ status: 'rejected', admin_notes: note || null, reviewed_at: new Date().toISOString() })
    .eq('reference_no', referenceNo);

  refresh();
  return error ? { ok: false, error: error.message } : { ok: true };
}