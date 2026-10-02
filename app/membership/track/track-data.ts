// Path: app/membership/track/track-data.ts
// Server-only read helper (NOT a server action, so it can't be called from the browser).
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';
import { REGISTRATIONS, isRegType } from '@/app/register/config';
import { getApplySessionId } from '../apply-session';
import type { OwnRegistration } from './track-types';

const TABLE = 'membership_applications';

export type TrackIdentity = {
  /** Logged-in member (confirmed email), even if they have no application yet. */
  signedInEmail: string | null;
  /** The application this visitor is entitled to see without typing credentials. */
  application: { applicationNo: string; email: string; isDraft: boolean } | null;
  /** Institute / student / clinic registrations made with the logged-in email. */
  registrations: OwnRegistration[];
};

export async function getTrackIdentity(): Promise<TrackIdentity> {
  const db = createServiceClient();

  // 1) Logged-in member: match their confirmed email (same rule the dashboard uses)
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && user.email_confirmed_at) {
      const email = user.email.toLowerCase();

      const [{ data }, { data: regs }] = await Promise.all([
        db.from(TABLE).select('application_no, email, is_draft').eq('email', email).maybeSingle(),
        db
          .from('registrations')
          .select('reference_no, type, email')
          .eq('email', email)
          .order('created_at', { ascending: false }),
      ]);

      return {
        signedInEmail: email,
        application: data
          ? { applicationNo: data.application_no, email: data.email, isDraft: !!data.is_draft }
          : null,
        registrations: (regs ?? [])
          .filter((r) => isRegType(r.type))
          .map((r) => ({
            referenceNo: r.reference_no,
            email: r.email,
            title: REGISTRATIONS[r.type as keyof typeof REGISTRATIONS].title,
          })),
      };
    }
  } catch {
    /* not logged in */
  }

  // 2) Not logged in, but resumed an unfinished application (email + date of birth)
  const draftId = await getApplySessionId();
  if (draftId) {
    const { data } = await db
      .from(TABLE)
      .select('application_no, email, is_draft')
      .eq('id', draftId)
      .eq('is_draft', true)
      .maybeSingle();

    if (data) {
      return {
        signedInEmail: null,
        application: { applicationNo: data.application_no, email: data.email, isDraft: true },
        registrations: [],
      };
    }
  }

  return { signedInEmail: null, application: null, registrations: [] };
}