// Path: app/admin/news/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';

const back = (q: string) => redirect(`/admin/news?${q}`);
const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'news'}-${Date.now().toString(36).slice(-4)}`;
}

function refresh() {
  revalidatePath('/admin/events'); // use '/admin/news' in the news file
  revalidatePath('/events');       // use '/news' in the news file
  revalidatePath('/', 'layout');   // refreshes the ticker on all pages
}

export async function addNews(formData: FormData) {
  await requireAdmin();

  const title = str(formData.get('title'));
  if (!title) return back('error=Title is required.');

  const { error } = await createAdminClient()
    .from('news')
    .insert({
      slug: slugify(title),
      title,
      category: str(formData.get('category')) || null,
      summary: str(formData.get('summary')) || null,
      body: str(formData.get('body')) || null,
      published_at: str(formData.get('published_at')) || undefined,
    });

  if (error) return back(`error=${encodeURIComponent(error.message)}`);
  refresh();
  back('ok=News added.');
}

export async function updateNews(formData: FormData) {
  await requireAdmin();

  const id = str(formData.get('id'));
  const title = str(formData.get('title'));
  if (!id || !title) return back('error=Title is required.');

  // slug is intentionally left unchanged so existing links keep working
  const { data: row, error } = await createAdminClient()
    .from('news')
    .update({
      title,
      category: str(formData.get('category')) || null,
      summary: str(formData.get('summary')) || null,
      body: str(formData.get('body')) || null,
      published_at: str(formData.get('published_at')) || undefined,
    })
    .eq('id', id)
    .select('slug')
    .single();

  if (error) return back(`error=${encodeURIComponent(error.message)}`);
  if (row?.slug) revalidatePath(`/news/${row.slug}`);
  refresh();
  back('ok=News updated.');
}

export async function deleteNews(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get('id'));

  const { data: row } = await createAdminClient().from('news').select('slug').eq('id', id).single();
  await createAdminClient().from('news').delete().eq('id', id);

  if (row?.slug) revalidatePath(`/news/${row.slug}`);
  refresh();
  back('ok=News deleted.');
}