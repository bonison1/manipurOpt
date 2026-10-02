// Path: app/admin/banner/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { uploadImage, removeImage } from '@/lib/media';
import { BANNER_KEYS } from '@/lib/banner';

const back = (q: string) => redirect(`/admin/banner?${q}`);
const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();
const hasFile = (f: FormDataEntryValue | null): f is File => f instanceof File && f.size > 0;

function refresh() {
  revalidatePath('/admin/banner');
  revalidatePath('/');
}

/* ---------- Text settings ---------- */

export async function saveBannerSettings(formData: FormData) {
  await requireAdmin();

  const ctaHref = str(formData.get('cta_href'));
  if (ctaHref && !/^(\/|https?:\/\/)/.test(ctaHref)) {
    return back('error=Button link must start with / or https://');
  }

  const rows = [
    { key: BANNER_KEYS.title, value: str(formData.get('title')) },
    { key: BANNER_KEYS.linkLabel, value: str(formData.get('link_label')) },
    { key: BANNER_KEYS.ctaLabel, value: str(formData.get('cta_label')) },
    { key: BANNER_KEYS.ctaHref, value: ctaHref },
  ];

  const { error } = await createAdminClient().from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) return back(`error=${encodeURIComponent(error.message)}`);

  refresh();
  back('ok=Banner text saved.');
}

/* ---------- Slides ---------- */

export async function addSlide(formData: FormData) {
  await requireAdmin();

  const file = formData.get('photo');
  if (!hasFile(file)) return back('error=Please choose a photo.');

  let error: string | null = null;
  let path: string | null = null;

  try {
    const up = await uploadImage(file, 'banner');
    path = up.path;
    const { error: dbErr } = await createAdminClient().from('banner_slides').insert({
      alt: str(formData.get('alt')) || null,
      sort_order: Number(formData.get('sort_order') ?? 0) || 0,
      photo_path: up.path,
      photo_url: up.url,
    });
    if (dbErr) {
      await removeImage(path);
      error = dbErr.message;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Upload failed.';
  }

  if (error) return back(`error=${encodeURIComponent(error)}`);
  refresh();
  back('ok=Slide added.');
}

export async function updateSlide(formData: FormData) {
  await requireAdmin();

  const id = str(formData.get('id'));
  const file = formData.get('photo');
  if (!id) return back('error=Missing slide.');

  const sb = createAdminClient();
  const updates: Record<string, string | number | null> = {
    alt: str(formData.get('alt')) || null,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
  };

  let newPath: string | null = null;
  let oldPath: string | null = null;
  let error: string | null = null;

  try {
    if (hasFile(file)) {
      const { data: existing } = await sb.from('banner_slides').select('photo_path').eq('id', id).single();
      oldPath = existing?.photo_path ?? null;

      const up = await uploadImage(file, 'banner');
      newPath = up.path;
      updates.photo_path = up.path;
      updates.photo_url = up.url;
    }

    const { error: dbErr } = await sb.from('banner_slides').update(updates).eq('id', id);
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
  back('ok=Slide updated.');
}

export async function deleteSlide(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get('id'));
  const sb = createAdminClient();

  const { data } = await sb.from('banner_slides').select('photo_path').eq('id', id).single();
  if (data?.photo_path) await removeImage(data.photo_path);
  await sb.from('banner_slides').delete().eq('id', id);

  refresh();
  back('ok=Slide removed.');
}