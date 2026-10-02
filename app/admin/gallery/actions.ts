'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { uploadImage, removeImage } from '@/lib/media';

type Sb = ReturnType<typeof createAdminClient>;

const back = (q: string) => redirect(`/admin/gallery?${q}`);

const refresh = () => {
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
};

function parsePos(v: FormDataEntryValue | null): number | null {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

async function setPosition(sb: Sb, id: string, pos: number) {
  const { error } = await sb.rpc('gallery_set_position', { p_id: id, p_pos: pos });
  if (error) throw new Error(error.message);
}

export async function addGalleryImages(formData: FormData) {
  await requireAdmin();
  const caption = String(formData.get('caption') ?? '').trim() || null;
  const startPos = parsePos(formData.get('position')); // blank = add to the end
  const files = formData.getAll('photo').filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return back('error=Choose at least one photo.');
  if (files.length > 5) return back('error=Upload up to 5 photos at a time.');

  const sb = createAdminClient();

  const { data: last } = await sb
    .from('gallery_images')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  let next = (last?.sort_order ?? 0) + 1;

  let error: string | null = null;
  let added = 0;

  for (const file of files) {
    try {
      const { path, url } = await uploadImage(file, 'gallery');
      const { data: row, error: dbErr } = await sb
        .from('gallery_images')
        .insert({ caption, storage_path: path, url, sort_order: next })
        .select('id')
        .single();

      if (dbErr || !row) {
        await removeImage(path);
        throw new Error(dbErr?.message ?? 'Could not save photo.');
      }
      next++;

      // several files uploaded together land in consecutive positions
      if (startPos) await setPosition(sb, row.id, startPos + added);
      added++;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Upload failed.';
      break;
    }
  }

  refresh();
  if (error) return back(`error=${encodeURIComponent(`${added} uploaded. ${error}`)}`);
  back(`ok=${added} photo(s) added.`);
}

export async function updateGalleryImage(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  const caption = String(formData.get('caption') ?? '').trim() || null;
  const position = parsePos(formData.get('position'));
  const file = formData.get('photo');

  if (!id) return back('error=Missing photo id.');

  const sb = createAdminClient();
  const updates: { caption: string | null; storage_path?: string; url?: string } = { caption };

  let newPath: string | null = null;
  let oldPath: string | null = null;
  let error: string | null = null;

  try {
    // Only touch the photo if a new file was actually chosen
    if (file instanceof File && file.size > 0) {
      const { data: existing } = await sb
        .from('gallery_images')
        .select('storage_path')
        .eq('id', id)
        .single();
      oldPath = existing?.storage_path ?? null;

      const { path, url } = await uploadImage(file, 'gallery');
      newPath = path;
      updates.storage_path = path;
      updates.url = url;
    }

    const { error: dbErr } = await sb.from('gallery_images').update(updates).eq('id', id);

    if (dbErr) {
      if (newPath) await removeImage(newPath); // roll back the new upload
      error = dbErr.message;
    } else {
      if (oldPath) await removeImage(oldPath); // remove old photo only after DB succeeded
      if (position) await setPosition(sb, id, position);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Update failed.';
  }

  refresh();
  if (error) return back(`error=${encodeURIComponent(error)}`);
  back('ok=Photo updated.');
}

export async function moveGalleryImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const dir = String(formData.get('dir') ?? '');
  const sb = createAdminClient();

  const { data } = await sb
    .from('gallery_images')
    .select('id')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const list = data ?? [];
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return back('error=Photo not found.');

  // current position = idx + 1
  const target = dir === 'up' ? idx : idx + 2;
  if (target < 1 || target > list.length) return back('ok=Already at the edge.');

  try {
    await setPosition(sb, id, target);
  } catch (e) {
    return back(`error=${encodeURIComponent(e instanceof Error ? e.message : 'Move failed.')}`);
  }

  refresh();
  back(`ok=Moved to position ${target}.`);
}

export async function deleteGalleryImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const sb = createAdminClient();
  const { data } = await sb.from('gallery_images').select('storage_path').eq('id', id).single();
  if (data?.storage_path) await removeImage(data.storage_path);
  await sb.from('gallery_images').delete().eq('id', id);
  refresh();
  back('ok=Photo removed.');
}