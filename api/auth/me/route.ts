import { NextResponse } from 'next/server';
import { getMe } from '@/lib/auth/get-me';

export const dynamic = 'force-dynamic';

// Returns { role, name } when signed in, or {} when signed out
export async function GET() {
  const me = await getMe();
  return NextResponse.json(me ?? {}, { headers: { 'Cache-Control': 'no-store' } });
}