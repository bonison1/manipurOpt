// Path: app/admin/hero/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { uploadImage, removeImage } from '@/lib/media';
import { HERO_KEYS, getHeroImage } from '@/lib/hero';

const back = (q: string) => redirect(`/admin/hero?${q}`);
const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();
const validHref = (h: string) => !h || /^(\/|https?:\/\/)/.test(h);

function refresh() {
  revalidatePath('/admin/hero');
  revalidatePath('/');
}

// Saves the hero text, and the photo too if a new one was chosen
export async function saveHero(formData: FormData) {
  await requireAdmin();

  const title = str(formData.get('title'));
  const tagline = str(formData.get('tagline'));
  const cta1Label = str(formData.get('cta1_label'));
  const cta1Href = str(formData.get('cta1_href'));
  const cta2Label = str(formData.get('cta2_label'));
  const cta2Href = str(formData.get('cta2_href'));
  const file = formData.get('photo');

  if (!title) return back('error=Heading is required.');
  if (!validHref(cta1Href) || !validHref(cta2Href)) {
    return back('error=Button links must start with / or https://');
  }
  if ((cta1Label && !cta1Href) || (cta2Label && !cta2Href)) {
    return back('error=A button with text also needs a link.');
  }

  const rows: { key: string; value: string }[] = [
    { key: HERO_KEYS.title, value: title },
    { key: HERO_KEYS.tagline, value: tagline },
    { key: HERO_KEYS.cta1Label, value: cta1Label },
    { key: HERO_KEYS.cta1Href, value: cta1Href },
    { key: HERO_KEYS.cta2Label, value: cta2Label },
    { key: HERO_KEYS.cta2Href, value: cta2Href },
  ];

  let error: string | null = null;
  let newPath: string | null = null;
  let oldPath: string | null = null;

  try {
    if (file instanceof File && file.size > 0) {
      oldPath = (await getHeroImage())?.path ?? null;
      const up = await uploadImage(file, 'hero');
      newPath = up.path;
      rows.push({ key: HERO_KEYS.url, value: up.url }, { key: HERO_KEYS.path, value: up.path });
    }

    const { error: dbErr } = await createAdminClient()
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });

    if (dbErr) {
      if (newPath) await removeImage(newPath); // roll back the new upload
      error = dbErr.message;
    } else if (oldPath) {
      await removeImage(oldPath); // remove the old photo only after the DB succeeded
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Save failed.';
  }

  if (error) return back(`error=${encodeURIComponent(error)}`);
  refresh();
  back('ok=Hero saved.');
}

export async function removeHeroImage() {
  await requireAdmin();

  const current = await getHeroImage();

  const { error } = await createAdminClient()
    .from('site_settings')
    .delete()
    .in('key', [HERO_KEYS.url, HERO_KEYS.path]);

  if (error) return back(`error=${encodeURIComponent(error.message)}`);
  if (current?.path) await removeImage(current.path);

  refresh();
  back('ok=Hero image removed. The homepage is using the default photo.');
}