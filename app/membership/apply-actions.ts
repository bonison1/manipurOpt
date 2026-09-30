// Path: app/membership/apply-actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import {
  CATEGORIES,
  DISTRICTS,
  DOCS_BUCKET,
  FEES,
  GENDERS,
  HIGHEST_QUALIFICATIONS,
  MAX_DOCS_BYTES,
  type FormState,
  type ResumeState,
  type StepResult,
} from './constants';
import { clearApplySession, setApplySession } from './apply-session';
import { getCurrentApplicationId } from './apply-data';

const TABLE = 'membership_applications';
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const SESSION_ENDED =
  'Your session has ended. Use “Continue application” with your email and date of birth to carry on.';

const clean = (v: unknown) => String(v ?? '').trim();

/* ------------------------------ helpers ------------------------------ */

async function currentDraft() {
  const id = await getCurrentApplicationId();
  if (!id) return null;
  const { data } = await createServiceClient().from(TABLE).select('*').eq('id', id).maybeSingle();
  return data && data.is_draft ? data : null;
}

function conflictErrors(error: { code?: string; message?: string }): Record<string, string> | null {
  if (error.code !== '23505') return null;
  const m = error.message ?? '';
  if (/aadhaar/i.test(m)) return { aadhaar: 'This Aadhaar number is already registered.' };
  if (/email/i.test(m)) return { email: 'This email is already used for another application.' };
  return {};
}

function validateStep(step: number, get: (k: string) => string, hasAadhaar: boolean) {
  const errors: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  if (step === 0) {
    const full_name = get('full_name');
    const date_of_birth = get('date_of_birth');
    const gender = get('gender');
    const phone = get('phone').replace(/[\s-]/g, '');
    const email = get('email').toLowerCase();

    if (full_name.length < 2) errors.full_name = 'Please enter your full name.';

    const dob = new Date(date_of_birth);
    if (!date_of_birth || Number.isNaN(dob.getTime())) {
      errors.date_of_birth = 'Please enter a valid date of birth.';
    } else if (dob > new Date() || dob.getFullYear() < 1920) {
      errors.date_of_birth = 'Date of birth is not valid.';
    }

    if (!(GENDERS as readonly string[]).includes(gender)) errors.gender = 'Please select your gender.';
    if (!/^(\+91)?[6-9]\d{9}$/.test(phone)) errors.phone = 'Enter a valid 10-digit WhatsApp number.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Enter a valid email address.';

    Object.assign(values, { full_name, date_of_birth, gender, phone, email });
  }

  if (step === 1) {
    const aadhaar = get('aadhaar').replace(/\s/g, '');
    const voter_id = get('voter_id').toUpperCase();
    const address = get('address');
    const city = get('city');
    const district = get('district');
    const state = get('state');
    const pin_code = get('pin_code');
    const country = get('country');
    const current_working_details = get('current_working_details');
    const practitioner = get('is_independent_practitioner');
    const professional_reg_no = get('professional_reg_no') || null;
    const membership_category = get('membership_category');

    if (aadhaar) {
      if (!/^\d{12}$/.test(aadhaar)) errors.aadhaar = 'Aadhaar must be exactly 12 digits.';
      else values.aadhaar = aadhaar;
    } else if (!hasAadhaar) {
      errors.aadhaar = 'Please enter your Aadhaar number.';
    }

    if (voter_id.length < 5 || voter_id.length > 30) errors.voter_id = 'Enter a valid Voter ID number.';
    if (address.length < 5) errors.address = 'Please enter your address.';
    if (!city) errors.city = 'Please enter your city / town / village.';
    if (!(DISTRICTS as readonly string[]).includes(district)) errors.district = 'Please select a district.';
    if (!state) errors.state = 'Please enter your state.';
    if (!/^\d{6}$/.test(pin_code)) errors.pin_code = 'PIN code must be exactly 6 digits.';
    if (!country) errors.country = 'Please enter your country.';
    if (!current_working_details) errors.current_working_details = 'Please enter your current working details.';
    if (practitioner !== 'yes' && practitioner !== 'no') {
      errors.is_independent_practitioner = 'Please choose an option.';
    }
    if (!(CATEGORIES as readonly string[]).includes(membership_category)) {
      errors.membership_category = 'Please select a membership category.';
    }

    Object.assign(values, {
      voter_id,
      address,
      city,
      district,
      state,
      pin_code,
      country,
      current_working_details,
      is_independent_practitioner: practitioner === 'yes',
      professional_reg_no,
      membership_category,
      fee_amount: FEES[membership_category as keyof typeof FEES] ?? null,
    });
  }

  if (step === 2) {
    const bo_university = get('bo_university');
    const bo_college = get('bo_college');
    const college_address = get('college_address');
    const bo_completion_date = get('bo_completion_date');
    const highest_qualification = get('highest_qualification');

    if (!bo_university) errors.bo_university = 'Please enter your university name.';
    if (!bo_college) errors.bo_college = 'Please enter your college name.';
    if (college_address.length < 5) errors.college_address = 'Please enter the college address.';

    const d = new Date(bo_completion_date);
    if (!bo_completion_date || Number.isNaN(d.getTime()) || d > new Date()) {
      errors.bo_completion_date = 'Please enter a valid completion date.';
    }
    if (!(HIGHEST_QUALIFICATIONS as readonly string[]).includes(highest_qualification)) {
      errors.highest_qualification = 'Please select your highest qualification.';
    }

    Object.assign(values, {
      bo_university,
      bo_college,
      college_address,
      bo_completion_date,
      highest_qualification,
    });
  }

  return { errors, values };
}

/* ---------------- Steps 1-3: create (step 1) or update the draft ---------------- */

export async function saveStep(step: number, formData: FormData): Promise<StepResult> {
  if (!Number.isInteger(step) || step < 0 || step > 2) return { ok: false, message: 'Invalid step.' };
  if (clean(formData.get('website')) !== '') return { ok: false, message: 'Submission could not be processed.' };

  const get = (k: string) => clean(formData.get(k));
  const db = createServiceClient();
  const draft = await currentDraft();

  if (!draft && step !== 0) return { ok: false, message: SESSION_ENDED, resume: true };
  if (draft && step > Number(draft.draft_step)) {
    return { ok: false, message: 'Please complete the earlier steps first.' };
  }

  const { errors, values } = validateStep(step, get, !!draft?.aadhaar);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Please correct the highlighted fields.', errors };
  }

  // ---- First step of a brand-new application: create the draft ----
  if (!draft) {
    const { data: existing } = await db
      .from(TABLE)
      .select('is_draft')
      .eq('email', values.email as string)
      .maybeSingle();

    if (existing) {
      return existing.is_draft
        ? {
            ok: false,
            message: 'You have already started an application with this email.',
            errors: { email: 'An unfinished application exists for this email.' },
            resume: true,
          }
        : {
            ok: false,
            message: 'An application with this email already exists.',
            errors: { email: 'This email has already been used to apply. Use the track page to check it.' },
          };
    }

    const { data, error } = await db
      .from(TABLE)
      .insert({ ...values, is_draft: true, draft_step: 1, declaration_accepted: null })
      .select('id, application_no')
      .single();

    if (error || !data) {
      const conflict = error ? conflictErrors(error) : null;
      if (conflict) return { ok: false, message: 'Please correct the highlighted fields.', errors: conflict };
      console.error('draft insert failed:', error);
      return { ok: false, message: 'Something went wrong while saving. Please try again.' };
    }

    await setApplySession(data.id);
    return { ok: true, applicationNo: data.application_no };
  }

  // ---- Existing draft: update this step ----
  const { error } = await db
    .from(TABLE)
    .update({ ...values, draft_step: Math.max(Number(draft.draft_step), step + 1) })
    .eq('id', draft.id)
    .eq('is_draft', true);

  if (error) {
    const conflict = conflictErrors(error);
    if (conflict) return { ok: false, message: 'Please correct the highlighted fields.', errors: conflict };
    console.error('draft update failed:', error);
    return { ok: false, message: 'Something went wrong while saving. Please try again.' };
  }

  return { ok: true, applicationNo: draft.application_no };
}

/* ---------------- Step 4: documents (PDF goes straight to storage) ---------------- */
// Next.js server actions / Vercel cap request bodies at ~4.5 MB, so a 10 MB PDF is uploaded
// from the browser directly to Supabase Storage using a one-time signed upload URL.

export async function createDocumentUpload(): Promise<{
  ok: boolean;
  message?: string;
  bucket?: string;
  path?: string;
  token?: string;
}> {
  const draft = await currentDraft();
  if (!draft) return { ok: false, message: SESSION_ENDED };
  if (Number(draft.draft_step) < 3) return { ok: false, message: 'Please complete the earlier steps first.' };

  const path = `${draft.id}/documents-${Date.now()}.pdf`;
  const { data, error } = await createServiceClient().storage.from(DOCS_BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    console.error('signed upload url failed:', error);
    return { ok: false, message: 'Could not start the upload. Please try again.' };
  }
  return { ok: true, bucket: DOCS_BUCKET, path: data.path, token: data.token };
}

export async function saveDocuments(path: string, fileName: string): Promise<StepResult> {
  const draft = await currentDraft();
  if (!draft) return { ok: false, message: SESSION_ENDED, resume: true };
  if (Number(draft.draft_step) < 3) return { ok: false, message: 'Please complete the earlier steps first.' };

  const prefix = `${draft.id}/`;
  const base = path.startsWith(prefix) ? path.slice(prefix.length) : '';
  if (!/^documents-\d+\.pdf$/.test(base)) return { ok: false, message: 'Invalid upload.' };

  const db = createServiceClient();
  const { data: files } = await db.storage.from(DOCS_BUCKET).list(draft.id, { search: base, limit: 5 });
  const file = files?.find((f) => f.name === base);
  if (!file) return { ok: false, message: 'The upload could not be verified. Please try again.' };

  const size = Number((file.metadata as { size?: number } | null)?.size ?? 0);
  if (size > MAX_DOCS_BYTES) {
    await db.storage.from(DOCS_BUCKET).remove([path]);
    return { ok: false, message: 'The PDF must be 10MB or smaller.' };
  }

  if (draft.documents_path && draft.documents_path !== path) {
    await db.storage.from(DOCS_BUCKET).remove([draft.documents_path]); // replace old upload
  }

  const documents_name = fileName.replace(/[^\w.\- ()]/g, '').slice(0, 120) || 'documents.pdf';
  const { error } = await db
    .from(TABLE)
    .update({
      documents_path: path,
      documents_name,
      draft_step: Math.max(Number(draft.draft_step), 4),
    })
    .eq('id', draft.id)
    .eq('is_draft', true);

  if (error) {
    console.error('save documents failed:', error);
    return { ok: false, message: 'Could not save your documents. Please try again.' };
  }
  return { ok: true, applicationNo: draft.application_no };
}

/* ---------------- Step 5: final submit ---------------- */

export async function finalizeApplication(formData: FormData): Promise<FormState> {
  if (clean(formData.get('website')) !== '') return { ok: false, message: 'Submission could not be processed.' };

  const draft = await currentDraft();
  if (!draft) return { ok: false, message: SESSION_ENDED };

  if (formData.get('declaration_accepted') !== 'on') {
    return {
      ok: false,
      message: 'Please accept the declaration to submit.',
      errors: { declaration_accepted: 'You must accept the declaration to apply.' },
    };
  }

  if (Number(draft.draft_step) < 4 || !draft.documents_path) {
    return { ok: false, message: 'Some steps are incomplete. Please go back and finish them.' };
  }

  const feeAmount = FEES[draft.membership_category as keyof typeof FEES];
  if (!feeAmount) return { ok: false, message: 'Please choose a membership category.' };

  const { error } = await createServiceClient()
    .from(TABLE)
    .update({
      is_draft: false,
      declaration_accepted: true,
      fee_amount: feeAmount,
      // keep the older dashboard / admin columns filled in
      qualification: draft.highest_qualification,
      institution: draft.bo_university,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', draft.id)
    .eq('is_draft', true);

  if (error) {
    console.error('finalize failed:', error);
    return { ok: false, message: 'Something went wrong while submitting. Please try again.' };
  }

  await clearApplySession();
  return { ok: true, applicationNo: draft.application_no, feeAmount, email: draft.email };
}

/* ---------------- Continue later: email + date of birth ---------------- */

export async function resumeApplication(_prev: ResumeState, formData: FormData): Promise<ResumeState> {
  const email = clean(formData.get('email')).toLowerCase();
  const dob = clean(formData.get('date_of_birth'));
  if (!email || !dob) return { error: 'Enter your email and date of birth.' };

  const generic =
    'We could not find an unfinished application with those details. Check them and try again.';

  const db = createServiceClient();
  const { data: app } = await db
    .from(TABLE)
    .select('id, date_of_birth, resume_failed_attempts, resume_locked_until')
    .eq('email', email)
    .eq('is_draft', true)
    .maybeSingle();

  if (!app) return { error: generic };

  if (app.resume_locked_until && new Date(app.resume_locked_until) > new Date()) {
    return { error: `Too many attempts. Please wait ${LOCK_MINUTES} minutes and try again.` };
  }

  if (String(app.date_of_birth) !== dob) {
    const attempts = Number(app.resume_failed_attempts ?? 0) + 1;
    await db
      .from(TABLE)
      .update(
        attempts >= MAX_ATTEMPTS
          ? {
              resume_failed_attempts: 0,
              resume_locked_until: new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString(),
            }
          : { resume_failed_attempts: attempts }
      )
      .eq('id', app.id);
    return { error: generic };
  }

  await db.from(TABLE).update({ resume_failed_attempts: 0, resume_locked_until: null }).eq('id', app.id);
  await setApplySession(app.id);
  redirect('/membership/apply');
}

export async function exitApplication() {
  await clearApplySession();
  redirect('/membership');
}
