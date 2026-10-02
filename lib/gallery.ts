import { createAdminClient } from '@/lib/auth/admin-client';

export type GalleryImage = {
  src: string;
  alt: string; // accessibility only, never shown on screen
  caption: string | null; // visible text, null when none was entered
};

export async function getGalleryImages(limit?: number): Promise<GalleryImage[]> {
  let query = createAdminClient()
    .from('gallery_images')
    .select('url, caption')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (limit && limit > 0) query = query.limit(limit);

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((r) => {
    const caption = r.caption?.trim() || null;
    return {
      src: r.url,
      alt: caption ?? 'MOA gallery photo',
      caption,
    };
  });
}