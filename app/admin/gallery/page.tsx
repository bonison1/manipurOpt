// Path: app/admin/gallery/page.tsx
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import UploadForm from '@/components/admin/UploadForm';
import AdminNav from '../AdminNav';
import { addGalleryImages, deleteGalleryImage } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminGallery({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const { data: images } = await createAdminClient()
    .from('gallery_images')
    .select('id, url, caption')
    .order('created_at', { ascending: false });

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Gallery</h1>
      <p className="mt-2 text-slate-500">Upload event photos (under 1 MB each).</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      <Card>
        <UploadForm action={addGalleryImages} multiple submitLabel="Upload photos">
          <input
            name="caption"
            placeholder="Caption / alt text (optional, applied to all selected)"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </UploadForm>
      </Card>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(images ?? []).map((img) => (
          <Card key={img.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption ?? ''} className="aspect-[4/3] w-full rounded-lg object-cover" />
            <p className="mt-2 truncate text-xs text-slate-500">{img.caption}</p>
            <form action={deleteGalleryImage} className="mt-2">
              <input type="hidden" name="id" value={img.id} />
              <button className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
            </form>
          </Card>
        ))}
        {(images ?? []).length === 0 && <p className="text-sm text-slate-500">No photos yet.</p>}
      </div>
    </div>
  );
}