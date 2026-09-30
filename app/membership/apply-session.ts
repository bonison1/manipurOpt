// Path: app/membership/apply-session.ts
// Signed, httpOnly cookie that remembers which unfinished application this browser may edit.
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE = 'moa_apply';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.APPLICATION_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('Set APPLICATION_SESSION_SECRET in your environment.');
  return s;
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export async function setApplySession(applicationId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${applicationId}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/membership',
    maxAge: MAX_AGE,
  });
}

export async function clearApplySession() {
  (await cookies()).set(COOKIE, '', { path: '/membership', maxAge: 0 });
}

export async function getApplySessionId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;

  const parts = value.split('.');
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;

  const expected = sign(`${id}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return null;

  return id;
}
