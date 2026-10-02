// Path: app/admin/banner/page.tsx
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getBannerSettings, getBannerSlides } from '@/lib/banner';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';
import AdminNav from '../AdminNav';
import { addSlide, deleteSlide, saveBannerSettings, updateSlide } from './actions';

export const dynamic = 'force-dynamic';

const input = 'w-full rounded-lg border px-3 py-2 text-sm';
const btn = 'rounded-lg bg-[#073b66] px-3 py-2 text-sm font-semibold text-white';
const label = 'block text-xs font-semibold text-slate-500';

export default async function AdminBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const [settings, slides] = await Promise.all([getBannerSettings(), getBannerSlides()]);

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Homepage banner</h1>
      <p className="mt-2 text-slate-500">
        The photo slideshow at the bottom of the homepage. Choose the photos, their order and the text on top.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      {/* Text */}
      <Card>
        <h2 className="font-bold text-[#073b66]">Banner text</h2>
        <form action={saveBannerSettings} className="mt-3 space-y-3">
          <PendingOverlay text="Saving..." />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Heading
              <input name="title" defaultValue={settings.title} className={`${input} mt-1`} />
            </label>
            <label className={label}>
              Gallery link text (leave empty to hide)
              <input name="link_label" defaultValue={settings.linkLabel} className={`${input} mt-1`} />
            </label>
            <label className={label}>
              Button text (leave empty to hide the button)
              <input name="cta_label" defaultValue={settings.ctaLabel} className={`${input} mt-1`} />
            </label>
            <label className={label}>
              Button link (e.g. /membership or https://...)
              <input name="cta_href" defaultValue={settings.ctaHref} className={`${input} mt-1`} />
            </label>
          </div>
          <SubmitButton pendingText="Saving..." className={btn}>
            Save text
          </SubmitButton>
        </form>
      </Card>

      {/* Add slide */}
      <Card>
        <h2 className="font-bold text-[#073b66]">Add a slide</h2>
        <form action={addSlide} className="mt-3 space-y-3">
          <PendingOverlay text="Uploading..." />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={`${label} sm:col-span-2`}>
              Photo description (for accessibility)
              <input name="alt" placeholder="e.g. CME workshop in Imphal" className={`${input} mt-1`} />
            </label>
            <label className={label}>
              Order (lowest first)
              <input name="sort_order" type="number" defaultValue={slides.length} className={`${input} mt-1`} />
            </label>
          </div>
          <label className={label}>
            Photo (required, under 1 MB)
            <input name="photo" type="file" accept="image/*" required className="mt-1 block w-full text-sm" />
          </label>
          <SubmitButton pendingText="Uploading..." className={btn}>
            Add slide
          </SubmitButton>
        </form>
      </Card>

      {/* Slides */}
      <h2 className="mt-10 text-xl font-black text-[#073b66]">Slides ({slides.length})</h2>
      {slides.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">
          No slides yet, so the homepage is showing your latest 6 gallery photos. Add a slide to take control.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((s) => (
          <Card key={s.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.photo_url} alt={s.alt ?? ''} className="aspect-video w-full rounded-lg object-cover" />
            <div className="mt-3 text-sm text-slate-600">
              {s.alt || <span className="text-slate-400">No description</span>}{' '}
              <span className="text-slate-400">· Order {s.sort_order}</span>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#073b66] hover:underline">
                Edit
              </summary>
              <form action={updateSlide} className="mt-3 space-y-2">
                <PendingOverlay text="Saving changes..." />
                <input type="hidden" name="id" value={s.id} />
                <input name="alt" defaultValue={s.alt ?? ''} placeholder="Photo description" className={input} />
                <input name="sort_order" type="number" defaultValue={s.sort_order} className={input} />
                <label className={label}>
                  Replace photo (optional, under 1 MB)
                  <input name="photo" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
                </label>
                <SubmitButton pendingText="Saving..." className={btn}>
                  Save changes
                </SubmitButton>
              </form>
            </details>

            <form action={deleteSlide} className="mt-3">
              <PendingOverlay text="Removing..." />
              <input type="hidden" name="id" value={s.id} />
              <SubmitButton pendingText="Removing..." className="text-sm font-semibold text-red-600 hover:underline">
                Remove
              </SubmitButton>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}