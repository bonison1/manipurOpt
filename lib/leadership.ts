// Path: lib/leadership.ts
import { createAdminClient } from '@/lib/auth/admin-client';

export type Leader = { id: string; name: string; role: string | null; photo_url: string };

export async function getLeaders(): Promise<Leader[]> {
  const { data } = await createAdminClient()
    .from('leadership')
    .select('id, name, role, photo_url')
    .order('sort_order')
    .order('created_at');
  return data ?? [];
}