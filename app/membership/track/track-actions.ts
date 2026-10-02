'use server';

// Path: app/membership/track/track-actions.ts

import { createServiceClient } from '@/lib/supabase/server';
import { REGISTRATIONS, REG_TYPES } from '@/app/register/config';
import { trackApplication } from '../actions';
import type { TrackResult, TrackedItem } from './track-types';

const NOT_FOUND = 'No application or registration found for that number and email.';

/**
 * One lookup for every form. The reference prefix decides where to look:
 *   MOA-…              -> membership_applications (existing trackApplication)
 *   INS- / STU- / CLN- -> registrations
 * Both need number AND email to match, same as before.
 */
export async function trackAny(no: string, email: string): Promise<TrackResult> {
  const ref = String(no ?? '').trim().toUpperCase();
  const mail = String(email ?? '').trim().toLowerCase();
  if (!ref || !mail) return { ok: false, message: NOT_FOUND };

  const prefix = ref.split('-')[0];
  const type = REG_TYPES.find((t) => REGISTRATIONS[t].prefix === prefix);

  // Membership application (default path, unchanged behaviour)
  if (!type) {
    const r = await trackApplication(ref, mail);
    if (r.ok && r.application) {
      return { ok: true, application: { ...r.application, kind: 'membership' } };
    }
    return { ok: false, message: r.message ?? NOT_FOUND };
  }

  // Institute / student / clinic registration
  const db = createServiceClient();
  const { data, error } = await db
    .from('registrations')
    .select('*')
    .eq('reference_no', ref)
    .eq('type', type)
    .eq('email', mail)
    .maybeSingle();

  if (error) {
    console.error('[trackAny] registrations lookup failed:', error);
    return { ok: false, message: NOT_FOUND };
  }
  if (!data) {
    console.warn('[trackAny] no registration row for', { ref, type, mail });
    return { ok: false, message: NOT_FOUND };
  }

  return {
    ok: true,
    application: {
      application_no: data.reference_no,
      full_name: data.name,
      membership_category: REGISTRATIONS[type].title,
      fee_amount: data.fee_amount ?? REGISTRATIONS[type].fee,
      status: data.status ?? 'pending',
      payment_status: data.payment_status ?? 'unpaid',
      admin_notes: data.admin_notes ?? null,
      reviewed_at: data.reviewed_at ?? null,
      created_at: data.created_at ?? null,
      kind: type,
    } as unknown as TrackedItem,
  };
}