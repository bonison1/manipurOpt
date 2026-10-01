// Path: app/admin/leadership/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { uploadImage, removeImage } from '@/lib/media';

const back = (q: string) => redirect(`/admin/leadership?${q}`);

export async function addLeader(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim() || null;
  const order = Number(formData.get('sort_order') ?? 0) || 0;
  const file = formData.get('photo');

  if (!name || !(file instanceof File) || file.size === 0) return back('error=Name and photo are required.');

  let error: string | null = null;
  try {
    const { path, url } = await uploadImage(file, 'leadership');
    const { error: dbErr } = await createAdminClient()
      .from('leadership')
      .insert({ name, role, sort_order: order, photo_path: path, photo_url: url });
    if (dbErr) {
      await removeImage(path);
      error = dbErr.message;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Upload failed.';
  }
  if (error) return back(`error=${encodeURIComponent(error)}`);

  revalidatePath('/admin/leadership');
  revalidatePath('/leadership');
  back('ok=Leader added.');
}

export async function deleteLeader(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const sb = createAdminClient();
  const { data } = await sb.from('leadership').select('photo_path').eq('id', id).single();
  if (data?.photo_path) await removeImage(data.photo_path);
  await sb.from('leadership').delete().eq('id', id);
  revalidatePath('/admin/leadership');
  revalidatePath('/leadership');
  back('ok=Leader removed.');
}