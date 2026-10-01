// Path: lib/gallery.ts
import { createAdminClient } from '@/lib/auth/admin-client';

export type GalleryImage = { src: string; alt: string };

export async function getGalleryImages(limit?: number): Promise<GalleryImage[]> {
  let q = createAdminClient()
    .from('gallery_images')
    .select('url, caption')
    .order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []).map((r) => ({ src: r.url, alt: r.caption || 'MOA gallery photo' }));
}