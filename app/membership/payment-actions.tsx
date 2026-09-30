'use server';

import { createClient } from '@supabase/supabase-js';

// CHANGE THESE to match your project (see the .from('...') in ../actions.ts):
const APPLICATIONS_TABLE = 'membership_applications';
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

// Registration number + email = same check as the tracker
async function findApplication(applicationNo: string, email: string) {
  return admin()
    .from(APPLICATIONS_TABLE)
    .select('id, fee_amount, payment_status, status, is_draft')
    .eq('application_no', applicationNo.trim().toUpperCase())
    .ilike(EMAIL_COLUMN, escapeLike(email.trim()))
    .maybeSingle();
}

/* Tells PayButton whether a proof already exists for this registration number,
   so the Pay button stays hidden after upload (even after refresh). */
export async function getProofStatus(applicationNo: string, email: string): Promise<ProofStatus> {
  if (!applicationNo || !email) return { status: 'none' };

  const { data: app } = await findApplication(applicationNo, email);
  if (!app) return { status: 'none' };

  const { data: proof } = await admin()
    .from('payment_proofs')
    .select('status, reviewer_note')
    .eq('application_id', app.id)
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

  const supabase = admin();

  const { data: app, error: appError } = await findApplication(applicationNo, email);
  if (appError) {
    console.error('application lookup failed:', appError);
    return { ok: false, error: 'Could not verify your application. Please try again.' };
  }
  if (!app) return { ok: false, error: 'Application not found.' };
  if (app.is_draft) return { ok: false, error: 'Please finish and submit your application first.' };
  if (app.payment_status !== 'unpaid') return { ok: false, error: 'This application is already paid.' };
  if (app.status === 'rejected') return { ok: false, error: 'This application was not approved.' };

  // Block a second proof while one is pending or approved
  const { data: existing } = await supabase
    .from('payment_proofs')
    .select('id')
    .eq('application_id', app.id)
    .in('status', ['pending', 'approved'])
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: false, error: 'Payment proof already submitted for this registration.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const path = `${app.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('proof upload failed:', uploadError);
    return { ok: false, error: 'Upload failed. Please try again.' };
  }

  const { error: insertError } = await supabase.from('payment_proofs').insert({
    application_id: app.id,
    transaction_ref: transactionRef || null,
    amount: app.fee_amount,
    file_path: path,
  });

  if (insertError) {
    console.error('proof insert failed:', insertError);
    await supabase.storage.from(BUCKET).remove([path]); // avoid orphan files
    return { ok: false, error: 'Could not save your submission. Please try again.' };
  }

  return { ok: true };
}

/* ---------------- Admin helpers ----------------
   Call these from your admin page. Add your own admin check first. */

export async function getProofUrl(filePath: string): Promise<string | null> {
  // TODO: verify the caller is an admin
  const { data, error } = await admin().storage.from(BUCKET).createSignedUrl(filePath, 600);
  return error ? null : data.signedUrl;
}

// Approve: marks the proof approved AND the application as paid
export async function approveProof(proofId: string): Promise<SubmitResult> {
  // TODO: verify the caller is an admin
  const supabase = admin();

  const { data: proof, error } = await supabase
    .from('payment_proofs')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', proofId)
    .select('application_id')
    .single();

  if (error || !proof) return { ok: false, error: 'Proof not found.' };

  const { error: appErr } = await supabase
    .from(APPLICATIONS_TABLE)
    .update({ payment_status: 'paid' })
    .eq('id', proof.application_id);

  return appErr ? { ok: false, error: appErr.message } : { ok: true };
}

// Reject: the Pay button reappears so the user can upload a new proof
export async function rejectProof(proofId: string, note: string): Promise<SubmitResult> {
  // TODO: verify the caller is an admin
  const { error } = await admin()
    .from('payment_proofs')
    .update({ status: 'rejected', reviewer_note: note, reviewed_at: new Date().toISOString() })
    .eq('id', proofId);

  return error ? { ok: false, error: error.message } : { ok: true };
}