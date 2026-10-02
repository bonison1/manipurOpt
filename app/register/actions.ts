// Path: app/register/actions.ts
'use server';

import { randomInt } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import {
  MAX_ADMISSION_YEAR,
  MIN_ADMISSION_YEAR,
  REGISTRATIONS,
  isRegType,
  type RegState,
} from './config';

const TABLE = 'registrations';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DUP_EMAIL_MSG =
  'This email is already registered with MOA. Log in or use "Track application" to see its status.';
const DUP_PHONE_MSG = 'This phone number is already registered with MOA.';

export async function submitRegistration(_prev: RegState, formData: FormData): Promise<RegState> {
  // Honeypot: bots fill it, people never see it. Pretend it worked (no fee, no payment button).
  if (String(formData.get('website') ?? '').trim() !== '') {
    return { ok: true, referenceNo: 'PENDING', email: '', feeAmount: 0 };
  }

  const type = String(formData.get('type') ?? '');
  if (!isRegType(type)) return { ok: false, error: 'Unknown registration type.' };
  const cfg = REGISTRATIONS[type];

  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const f of cfg.fields) {
    let v = String(formData.get(f.name) ?? '').trim();
    if (f.name === 'email') v = v.toLowerCase();
    if (f.name === 'phone') v = v.replace(/[\s-]/g, '');
    values[f.name] = v;

    if (!v) errors[f.name] = 'This field is required.';
    else if (f.maxLength && v.length > f.maxLength) errors[f.name] = `Maximum ${f.maxLength} characters.`;
    else if (f.name === 'email' && !EMAIL_RE.test(v)) errors[f.name] = 'Enter a valid email address.';
    else if (f.name === 'phone' && !/^[0-9]{10}$/.test(v)) errors[f.name] = 'Enter a 10-digit mobile number.';
    else if (f.name === 'admission_year') {
      const y = Number(v);
      if (!Number.isInteger(y) || y < MIN_ADMISSION_YEAR || y > MAX_ADMISSION_YEAR) {
        errors[f.name] = 'Select a valid year.';
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, error: 'Please fix the highlighted fields.', errors, values };
  }

  const db = createServiceClient();

  // Friendly duplicate check across ALL forms (membership + every registration type).
  // contact_registry is the shared table; the DB trigger is the real guard.
  // NOTE: never echo the existing reference number back, it works as a login secret.
  const { data: dupEmail } = await db
    .from('contact_registry')
    .select('id')
    .eq('email', values.email)
    .maybeSingle();
  if (dupEmail) return { ok: false, error: DUP_EMAIL_MSG, values };

  const { data: dupPhone } = await db
    .from('contact_registry')
    .select('id')
    .eq('phone', values.phone)
    .maybeSingle();
  if (dupPhone) return { ok: false, error: DUP_PHONE_MSG, values };

  const row: Record<string, unknown> = { type, ...values, fee_amount: cfg.fee };
  if (row.admission_year) row.admission_year = Number(row.admission_year);

  // Retry a couple of times in the unlikely event of a reference-number collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const referenceNo = `${cfg.prefix}-${new Date().getFullYear()}-${randomInt(100000, 999999)}`;
    const { error } = await db.from(TABLE).insert({ ...row, reference_no: referenceNo });

    if (!error) return { ok: true, referenceNo, email: values.email, feeAmount: cfg.fee };

    if (error.code === '23505') {
      const msg = String(error.message);
      if (msg.includes('DUPLICATE_EMAIL') || msg.includes('registrations_type_email_key')) {
        return { ok: false, error: DUP_EMAIL_MSG, values };
      }
      if (msg.includes('DUPLICATE_PHONE')) {
        return { ok: false, error: DUP_PHONE_MSG, values };
      }
      continue; // reference-number collision: try a new number
    }
    console.error('registration insert failed', error);
    break;
  }

  return { ok: false, error: 'Something went wrong. Please try again.', values };
}