// Path: app/admin/events/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { uploadImage, removeImage } from '@/lib/media';

const back = (q: string) => redirect(`/admin/events?${q}`);
const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();
const hasFile = (f: FormDataEntryValue | null): f is File => f instanceof File && f.size > 0;

function refresh() {
  revalidatePath('/admin/events'); // use '/admin/news' in the news file
  revalidatePath('/events');       // use '/news' in the news file
  revalidatePath('/', 'layout');   // refreshes the ticker on all pages
}

export async function addEvent(formData: FormData) {
  await requireAdmin();

  const title = str(formData.get('title'));
  const date = str(formData.get('date'));
  const file = formData.get('photo');

  if (!title || !date) return back('error=Title and date are required.');

  const row: Record<string, string | null> = {
    title,
    date,
    type: str(formData.get('type')) || null,
    location: str(formData.get('location')) || null,
    description: str(formData.get('description')) || null,
    photo_path: null,
    photo_url: null,
  };

  let error: string | null = null;
  let path: string | null = null;

  try {
    if (hasFile(file)) {
      const up = await uploadImage(file, 'events');
      path = up.path;
      row.photo_path = up.path;
      row.photo_url = up.url;
    }
    const { error: dbErr } = await createAdminClient().from('events').insert(row);
    if (dbErr) {
      if (path) await removeImage(path);
      error = dbErr.message;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Could not add event.';
  }

  if (error) return back(`error=${encodeURIComponent(error)}`);
  refresh();
  back('ok=Event added.');
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();

  const id = str(formData.get('id'));
  const title = str(formData.get('title'));
  const date = str(formData.get('date'));
  const file = formData.get('photo');
  const removePhoto = formData.get('remove_photo') === 'on';

  if (!id || !title || !date) return back('error=Title and date are required.');

  const sb = createAdminClient();
  const updates: Record<string, string | null> = {
    title,
    date,
    type: str(formData.get('type')) || null,
    location: str(formData.get('location')) || null,
    description: str(formData.get('description')) || null,
  };

  let newPath: string | null = null;
  let oldPath: string | null = null;
  let error: string | null = null;

  try {
    if (hasFile(file) || removePhoto) {
      const { data: existing } = await sb.from('events').select('photo_path').eq('id', id).single();
      oldPath = existing?.photo_path ?? null;

      if (hasFile(file)) {
        const up = await uploadImage(file, 'events');
        newPath = up.path;
        updates.photo_path = up.path;
        updates.photo_url = up.url;
      } else {
        updates.photo_path = null;
        updates.photo_url = null;
      }
    }

    const { error: dbErr } = await sb.from('events').update(updates).eq('id', id);
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
  revalidatePath(`/event/${id}`);
  refresh();
  back('ok=Event updated.');
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get('id'));
  const sb = createAdminClient();

  const { data } = await sb.from('events').select('photo_path').eq('id', id).single();
  if (data?.photo_path) await removeImage(data.photo_path);
  await sb.from('events').delete().eq('id', id);

  revalidatePath(`/event/${id}`);
  refresh();
  back('ok=Event deleted.');
}