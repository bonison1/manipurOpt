// Path: app/admin/gallery/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { uploadImage, removeImage } from '@/lib/media';

const back = (q: string) => redirect(`/admin/gallery?${q}`);

export async function addGalleryImages(formData: FormData) {
  await requireAdmin();
  const caption = String(formData.get('caption') ?? '').trim() || null;
  const files = formData.getAll('photo').filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return back('error=Choose at least one photo.');
  if (files.length > 5) return back('error=Upload up to 5 photos at a time.');

  const sb = createAdminClient();
  let error: string | null = null;
  let added = 0;

  for (const file of files) {
    try {
      const { path, url } = await uploadImage(file, 'gallery');
      const { error: dbErr } = await sb.from('gallery_images').insert({ caption, storage_path: path, url });
      if (dbErr) {
        await removeImage(path);
        throw new Error(dbErr.message);
      }
      added++;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Upload failed.';
      break;
    }
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  if (error) return back(`error=${encodeURIComponent(`${added} uploaded. ${error}`)}`);
  back(`ok=${added} photo(s) added.`);
}

export async function deleteGalleryImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const sb = createAdminClient();
  const { data } = await sb.from('gallery_images').select('storage_path').eq('id', id).single();
  if (data?.storage_path) await removeImage(data.storage_path);
  await sb.from('gallery_images').delete().eq('id', id);
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  back('ok=Photo removed.');
}