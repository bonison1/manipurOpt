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

  if (!name || !(file instanceof File) || file.size === 0) {
    return back('error=Name and photo are required.');
  }

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

export async function updateLeader(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim() || null;
  const order = Number(formData.get('sort_order') ?? 0) || 0;
  const file = formData.get('photo');

  if (!id || !name) return back('error=Name is required.');

  const sb = createAdminClient();
  const updates: {
    name: string;
    role: string | null;
    sort_order: number;
    photo_path?: string;
    photo_url?: string;
  } = { name, role, sort_order: order };

  let newPath: string | null = null;
  let oldPath: string | null = null;
  let error: string | null = null;

  try {
    // Only touch the photo if a new file was actually chosen
    if (file instanceof File && file.size > 0) {
      const { data: existing } = await sb
        .from('leadership')
        .select('photo_path')
        .eq('id', id)
        .single();
      oldPath = existing?.photo_path ?? null;

      const { path, url } = await uploadImage(file, 'leadership');
      newPath = path;
      updates.photo_path = path;
      updates.photo_url = url;
    }

    const { error: dbErr } = await sb.from('leadership').update(updates).eq('id', id);

    if (dbErr) {
      if (newPath) await removeImage(newPath); // roll back the new upload
      error = dbErr.message;
    } else if (oldPath) {
      await removeImage(oldPath); // remove old photo only after DB succeeded
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Update failed.';
  }

  if (error) return back(`error=${encodeURIComponent(error)}`);

  revalidatePath('/admin/leadership');
  revalidatePath('/leadership');
  back('ok=Leader updated.');
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