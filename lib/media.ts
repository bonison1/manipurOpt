// Path: lib/media.ts
import { createAdminClient } from '@/lib/auth/admin-client';

export const BUCKET = 'moa-media';
export const MAX_BYTES = 1024 * 1024; // photos must be below 1 MB
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export type MediaFolder = 'leadership' | 'gallery' | 'events' | 'messages' | 'banner' | 'hero';

export async function uploadImage(file: File, folder: MediaFolder) {
  if (file.size >= MAX_BYTES) throw new Error(`${file.name} must be under 1 MB.`);
  const ext = TYPES[file.type];
  if (!ext) throw new Error(`${file.name}: only JPG, PNG or WebP allowed.`);

  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const sb = createAdminClient();
  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeImage(path: string) {
  await createAdminClient().storage.from(BUCKET).remove([path]);
}