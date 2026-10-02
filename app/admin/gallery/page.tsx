import Link from 'next/link';
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import UploadForm from '@/components/admin/UploadForm';
import { LayoutGuide } from '@/components/admin/LayoutGuide';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';
import { TILE_ASPECT, TILE_DIMS, TILE_LABEL, TILE_SPAN, tileFor } from '@/lib/gallery-layout';
import AdminNav from '../AdminNav';
import {
  addGalleryImages,
  deleteGalleryImage,
  moveGalleryImage,
  updateGalleryImage,
} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminGallery({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const { data } = await createAdminClient()
    .from('gallery_images')
    .select('id, url, caption')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  const images = data ?? [];

  const input = 'w-full rounded-lg border px-3 py-2 text-sm';
  const moveBtn =
    'grid h-7 w-7 place-items-center rounded-md border text-sm font-bold text-[#073b66] hover:bg-slate-50 disabled:opacity-40';

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-[#073b66]">Gallery</h1>
          <p className="mt-2 text-slate-500">
            Upload event photos (under 1 MB each, up to 5 at a time). Captions appear over the photo
            on the public page; leave blank for no text.
          </p>
        </div>
        <Link href="/gallery" target="_blank" className="text-sm font-semibold text-[#073b66] hover:underline">
          View public gallery ↗
        </Link>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      <Card>
        <UploadForm action={addGalleryImages} multiple submitLabel="Upload photos">
          <input
            name="caption"
            placeholder="Caption shown on the photo (optional, applied to all selected)"
            className={input}
          />
          <label className="block text-xs text-slate-500">
            Position (optional). Blank adds to the end; several photos take consecutive positions.
            <input
              name="position"
              type="number"
              min={1}
              placeholder="e.g. 1 for the Featured tile"
              className={`${input} mt-1`}
            />
          </label>
        </UploadForm>
      </Card>

      <LayoutGuide />

      <div className="mt-6 grid grid-cols-2 items-start gap-4 md:grid-cols-4">
        {images.map((img, i) => {
          const tile = tileFor(i);
          return (
            <Card key={img.id} className={TILE_SPAN[tile].includes('col-span-2') ? 'col-span-2' : ''}>
              <div className="relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption ?? ''}
                  className={`w-full object-cover ${TILE_ASPECT[tile]}`}
                />
                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#073b66]">
                  #{i + 1} · {TILE_LABEL[tile]} {TILE_DIMS[tile]}
                </span>
                {img.caption && (
                  <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs font-semibold text-white line-clamp-2">
                    {img.caption}
                  </p>
                )}
              </div>
              {!img.caption && <p className="mt-2 text-xs italic text-slate-400">No caption</p>}

              <div className="mt-2 flex items-center gap-1.5">
                <form action={moveGalleryImage}>
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="dir" value="up" />
                  <SubmitButton pendingText="…" className={moveBtn}>
                    ↑
                  </SubmitButton>
                </form>
                <form action={moveGalleryImage}>
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="dir" value="down" />
                  <SubmitButton pendingText="…" className={moveBtn}>
                    ↓
                  </SubmitButton>
                </form>
                <span className="text-xs text-slate-500">Position {i + 1} of {images.length}</span>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-semibold text-[#073b66] hover:underline">
                  Edit
                </summary>
                <form action={updateGalleryImage} className="mt-3 space-y-2">
                  <PendingOverlay text="Saving changes..." />
                  <input type="hidden" name="id" value={img.id} />
                  <input
                    name="caption"
                    defaultValue={img.caption ?? ''}
                    placeholder="Caption shown on the photo"
                    className={input}
                  />
                  <label className="block text-xs text-slate-500">
                    Position (1 to {images.length})
                    <input
                      name="position"
                      type="number"
                      min={1}
                      max={images.length}
                      defaultValue={i + 1}
                      className={`${input} mt-1`}
                    />
                  </label>
                  <label className="block text-xs text-slate-500">
                    Replace photo (optional, under 1 MB)
                    <input
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="mt-1 block w-full text-sm"
                    />
                  </label>
                  <SubmitButton
                    pendingText="Saving..."
                    className="rounded-lg bg-[#073b66] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Save changes
                  </SubmitButton>
                </form>
              </details>

              <form action={deleteGalleryImage} className="mt-2">
                <PendingOverlay text="Deleting..." />
                <input type="hidden" name="id" value={img.id} />
                <SubmitButton
                  pendingText="Deleting..."
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Delete
                </SubmitButton>
              </form>
            </Card>
          );
        })}
        {images.length === 0 && <p className="text-sm text-slate-500">No photos yet.</p>}
      </div>
    </div>
  );
}