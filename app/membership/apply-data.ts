// Path: app/membership/apply-data.ts
// Read helpers (NOT server actions, so they cannot be called from the browser).
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';
import { STEP_FIELDS, type DraftData } from './constants';
import { getApplySessionId } from './apply-session';

const TABLE = 'membership_applications';

/** Which unfinished application may this visitor edit?
 *  1) the signed "resume" cookie (email + date of birth), or
 *  2) a logged-in member whose confirmed email matches an unfinished application. */
export async function getCurrentApplicationId(): Promise<string | null> {
  const fromCookie = await getApplySessionId();
  if (fromCookie) return fromCookie;

  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && user.email_confirmed_at) {
      const { data } = await createServiceClient()
        .from(TABLE)
        .select('id')
        .eq('email', user.email.toLowerCase())
        .eq('is_draft', true)
        .maybeSingle();
      return data?.id ?? null;
    }
  } catch {
    /* not logged in */
  }
  return null;
}

// Aadhaar is deliberately NOT sent back to the browser (only the last 4 digits).
const VALUE_FIELDS = [...STEP_FIELDS[0], ...STEP_FIELDS[1], ...STEP_FIELDS[2]].filter(
  (f) => f !== 'aadhaar'
);

export async function loadDraft(id: string): Promise<DraftData | null> {
  const { data } = await createServiceClient().from(TABLE).select('*').eq('id', id).maybeSingle();
  if (!data || !data.is_draft) return null;

  const values: Record<string, string> = {};
  for (const f of VALUE_FIELDS) {
    const v = data[f];
    if (f === 'is_independent_practitioner') values[f] = v === true ? 'yes' : v === false ? 'no' : '';
    else values[f] = v == null ? '' : String(v);
  }

  return {
    applicationNo: data.application_no,
    step: Math.min(Number(data.draft_step ?? 0), 4),
    values,
    aadhaarLast4: data.aadhaar ? String(data.aadhaar).slice(-4) : null,
    documentsName: data.documents_name ?? null,
  };
}
