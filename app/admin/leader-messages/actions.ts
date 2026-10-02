// Path: app/admin/leader-messages/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { uploadImage, removeImage } from '@/lib/media';

const back = (q: string) => redirect(`/admin/leader-messages?${q}`);
const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();
const hasFile = (f: FormDataEntryValue | null): f is File => f instanceof File && f.size > 0;

function refresh() {
  revalidatePath('/admin/leader-messages');
  revalidatePath('/about');
}

export async function addLeaderMessage(formData: FormData) {
  await requireAdmin();

  const name = str(formData.get('name'));
  const message = str(formData.get('message'));
  const file = formData.get('photo');

  if (!name || !message) return back('error=Name and message are required.');

  const row: Record<string, string | number | null> = {
    name,
    role: str(formData.get('role')) || null,
    message,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    photo_path: null,
    photo_url: null,
  };

  let error: string | null = null;
  let path: string | null = null;

  try {
    if (hasFile(file)) {
      const up = await uploadImage(file, 'messages');
      path = up.path;
      row.photo_path = up.path;
      row.photo_url = up.url;
    }
    const { error: dbErr } = await createAdminClient().from('leader_messages').insert(row);
    if (dbErr) {
      if (path) await removeImage(path);
      error = dbErr.message;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Could not add message.';
  }

  if (error) return back(`error=${encodeURIComponent(error)}`);
  refresh();
  back('ok=Message added.');
}

export async function updateLeaderMessage(formData: FormData) {
  await requireAdmin();

  const id = str(formData.get('id'));
  const name = str(formData.get('name'));
  const message = str(formData.get('message'));
  const file = formData.get('photo');
  const removePhoto = formData.get('remove_photo') === 'on';

  if (!id || !name || !message) return back('error=Name and message are required.');

  const sb = createAdminClient();
  const updates: Record<string, string | number | null> = {
    name,
    role: str(formData.get('role')) || null,
    message,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
  };

  let newPath: string | null = null;
  let oldPath: string | null = null;
  let error: string | null = null;

  try {
    if (hasFile(file) || removePhoto) {
      const { data: existing } = await sb.from('leader_messages').select('photo_path').eq('id', id).single();
      oldPath = existing?.photo_path ?? null;

      if (hasFile(file)) {
        const up = await uploadImage(file, 'messages');
        newPath = up.path;
        updates.photo_path = up.path;
        updates.photo_url = up.url;
      } else {
        updates.photo_path = null;
        updates.photo_url = null;
      }
    }

    const { error: dbErr } = await sb.from('leader_messages').update(updates).eq('id', id);
    if (dbErr) {
      if (newPath) await removeImage(newPath);
      error = dbErr.message;
    } else if (oldPath) {
      await removeImage(oldPath);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Update failed.';
  }

  if (error) return back(`error=${encodeURIComponent(error)}`);
  refresh();
  back('ok=Message updated.');
}

export async function deleteLeaderMessage(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get('id'));
  const sb = createAdminClient();

  const { data } = await sb.from('leader_messages').select('photo_path').eq('id', id).single();
  if (data?.photo_path) await removeImage(data.photo_path);
  await sb.from('leader_messages').delete().eq('id', id);

  refresh();
  back('ok=Message deleted.');
}