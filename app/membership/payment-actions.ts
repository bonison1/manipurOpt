// app/membership/payment-actions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth/require-admin';

const MEMBERSHIP_TABLE = 'membership_applications';
const REGISTRATIONS_TABLE = 'registrations';
const EMAIL_COLUMN = 'email';

const BUCKET = 'payment-proofs';
const MAX_SIZE = 4 * 1024 * 1024; // keep under next.config bodySizeLimit (5mb) and Vercel's ~4.5 MB cap
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// If you already have a server-side admin client helper, use that instead.
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only, never NEXT_PUBLIC_
    { auth: { persistSession: false } }
  );
}

export type SubmitResult = { ok: boolean; error?: string };
export type ProofStatus = {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  note?: string | null;
};

// Escape % and _ so ilike acts as a case-insensitive exact match
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

// Registration references look like INS-2026-123456 / STU-… / CLN-…; everything else is a membership number.
type Kind = 'membership' | 'registration';
const kindOf = (no: string): Kind =>
  /^(INS|STU|CLN)-\d{4}-\d{6}$/i.test(no.trim()) ? 'registration' : 'membership';

// One flat shape for both tables (registrations are never drafts).
type LookupRow = {
  id: string;
  fee_amount: number;
  payment_status: string;
  status: string;
  is_draft: boolean;
};
type Lookup = { data: LookupRow | null; error: { message: string } | null };

// Registration number + email = same check as the tracker
async function findRecord(kind: Kind, no: string, email: string): Promise<Lookup> {
  const reference = no.trim().toUpperCase();
  const mail = escapeLike(email.trim());

  if (kind === 'registration') {
    const { data, error } = await admin()
      .from(REGISTRATIONS_TABLE)
      .select('id, fee_amount, payment_status, status')
      .eq('reference_no', reference)
      .ilike(EMAIL_COLUMN, mail)
      .maybeSingle();
    return {
      data: data
        ? {
            id: data.id,
            fee_amount: Number(data.fee_amount ?? 0),
            payment_status: data.payment_status,
            status: data.status,
            is_draft: false,
          }
        : null,
      error,
    };
  }

  const { data, error } = await admin()
    .from(MEMBERSHIP_TABLE)
    .select('id, fee_amount, payment_status, status, is_draft')
    .eq('application_no', reference)
    .ilike(EMAIL_COLUMN, mail)
    .maybeSingle();
  return {
    data: data
      ? {
          id: data.id,
          fee_amount: Number(data.fee_amount ?? 0),
          payment_status: data.payment_status,
          status: data.status,
          is_draft: !!data.is_draft,
        }
      : null,
    error,
  };
}

const ownerColumn = (kind: Kind) => (kind === 'registration' ? 'registration_id' : 'application_id');

/* Tells PayButton whether a proof already exists for this registration number,
   so the Pay button stays hidden after upload (even after refresh). */
export async function getProofStatus(applicationNo: string, email: string): Promise<ProofStatus> {
  if (!applicationNo || !email) return { status: 'none' };
  const kind = kindOf(applicationNo);

  const { data: app } = await findRecord(kind, applicationNo, email);
  if (!app) return { status: 'none' };

  const { data: proof } = await admin()
    .from('payment_proofs')
    .select('status, reviewer_note')
    .eq(ownerColumn(kind), app.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!proof) return { status: 'none' };
  return { status: proof.status as ProofStatus['status'], note: proof.reviewer_note };
}

export async function submitPaymentProof(formData: FormData): Promise<SubmitResult> {
  const applicationNo = String(formData.get('applicationNo') ?? '');
  const email = String(formData.get('email') ?? '');
  const transactionRef = String(formData.get('transactionRef') ?? '').trim(); // optional
  const file = formData.get('proof');

  if (!applicationNo || !email) return { ok: false, error: 'Missing application details.' };
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Please attach your payment screenshot.' };
  if (!ALLOWED.includes(file.type)) return { ok: false, error: 'Only JPG, PNG, WEBP or PDF files are allowed.' };
  if (file.size > MAX_SIZE) return { ok: false, error: 'File must be 4 MB or smaller.' };

  const kind = kindOf(applicationNo);
  const supabase = admin();

  const { data: app, error: appError } = await findRecord(kind, applicationNo, email);
  if (appError) {
    console.error('record lookup failed:', appError);
    return { ok: false, error: 'Could not verify your details. Please try again.' };
  }
  if (!app) return { ok: false, error: kind === 'registration' ? 'Registration not found.' : 'Application not found.' };
  if (app.is_draft) return { ok: false, error: 'Please finish and submit your application first.' };
  if (app.payment_status !== 'unpaid') return { ok: false, error: 'This registration is already paid.' };
  if (app.status === 'rejected') return { ok: false, error: 'This registration was not approved.' };

  // Block a second proof while one is pending or approved
  const { data: existing } = await supabase
    .from('payment_proofs')
    .select('id')
    .eq(ownerColumn(kind), app.id)
    .in('status', ['pending', 'approved'])
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: false, error: 'Payment proof already submitted for this registration.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const path = `${kind === 'registration' ? 'reg/' : ''}${app.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('proof upload failed:', uploadError);
    return { ok: false, error: 'Upload failed. Please try again.' };
  }

  const { error: insertError } = await supabase.from('payment_proofs').insert({
    [ownerColumn(kind)]: app.id,
    transaction_ref: transactionRef || null,
    amount: app.fee_amount,
    file_path: path,
  });

  if (insertError) {
    console.error('proof insert failed:', insertError);
    await supabase.storage.from(BUCKET).remove([path]); // avoid orphan files
    return { ok: false, error: 'Could not save your submission. Please try again.' };
  }

  revalidatePath('/admin/registrations');
  return { ok: true };
}

/* ---------------- Admin helpers ---------------- */

export async function getProofUrl(filePath: string): Promise<string | null> {
  if (!(await isAdmin())) return null;
  const { data, error } = await admin().storage.from(BUCKET).createSignedUrl(filePath, 600);
  return error ? null : data.signedUrl;
}

// Approve: marks the proof approved AND the membership application / registration as paid
export async function approveProof(proofId: string): Promise<SubmitResult> {
  if (!(await isAdmin())) return { ok: false, error: 'Not authorized.' };
  const supabase = admin();

  const { data: proof, error } = await supabase
    .from('payment_proofs')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', proofId)
    .select('application_id, registration_id')
    .single();

  if (error || !proof) return { ok: false, error: 'Proof not found.' };

  const target = proof.registration_id
    ? supabase.from(REGISTRATIONS_TABLE).update({ payment_status: 'paid', paid_at: new Date().toISOString() }).eq('id', proof.registration_id)
    : supabase.from(MEMBERSHIP_TABLE).update({ payment_status: 'paid' }).eq('id', proof.application_id);

  const { error: appErr } = await target;
  if (appErr) return { ok: false, error: appErr.message };

  revalidatePath('/admin/registrations');
  return { ok: true };
}

// Reject: the Pay button reappears so the user can upload a new proof
export async function rejectProof(proofId: string, note: string): Promise<SubmitResult> {
  if (!(await isAdmin())) return { ok: false, error: 'Not authorized.' };

  const { error } = await admin()
    .from('payment_proofs')
    .update({ status: 'rejected', reviewer_note: note, reviewed_at: new Date().toISOString() })
    .eq('id', proofId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/registrations');
  return { ok: true };
}