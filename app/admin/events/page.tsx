// Path: app/admin/events/page.tsx
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getAllEvents } from '@/lib/content';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';
import AdminNav from '../AdminNav';
import { addEvent, deleteEvent, updateEvent } from './actions';

export const dynamic = 'force-dynamic';

const input = 'w-full rounded-lg border px-3 py-2 text-sm';
const btn = 'rounded-lg bg-[#073b66] px-3 py-2 text-sm font-semibold text-white';

export default async function AdminEvents({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const events = await getAllEvents();

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Events</h1>
      <p className="mt-2 text-slate-500">Add, edit or delete events. Photo is optional (under 1 MB).</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      {/* Add */}
      <Card>
        <form action={addEvent} className="space-y-3">
          <PendingOverlay text="Adding event..." />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="title" required placeholder="Event title" className={input} />
            <input name="date" type="date" required className={input} />
            <input name="type" placeholder="Type (e.g. CME, Workshop)" className={input} />
            <input name="location" placeholder="Location" className={input} />
          </div>
          <textarea name="description" rows={4} placeholder="Description" className={input} />
          <label className="block text-xs text-slate-500">
            Photo (optional, under 1 MB)
            <input name="photo" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
          </label>
          <SubmitButton pendingText="Adding..." className={btn}>
            Add event
          </SubmitButton>
        </form>
      </Card>

      {/* List */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Card key={e.id}>
            {e.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.photo_url} alt={e.title} className="mb-3 aspect-video w-full rounded-lg object-cover" />
            )}
            <div className="font-bold text-[#073b66]">{e.title}</div>
            <div className="text-sm text-slate-500">
              {e.date} {e.type && `· ${e.type}`} {e.location && `· ${e.location}`}
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#073b66] hover:underline">
                Edit
              </summary>
              <form action={updateEvent} className="mt-3 space-y-2">
                <PendingOverlay text="Saving changes..." />
                <input type="hidden" name="id" value={e.id} />
                <input name="title" required defaultValue={e.title} className={input} />
                <input name="date" type="date" required defaultValue={e.date} className={input} />
                <input name="type" defaultValue={e.type ?? ''} placeholder="Type" className={input} />
                <input name="location" defaultValue={e.location ?? ''} placeholder="Location" className={input} />
                <textarea name="description" rows={4} defaultValue={e.description ?? ''} className={input} />
                <label className="block text-xs text-slate-500">
                  Replace photo (optional, under 1 MB)
                  <input name="photo" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
                </label>
                {e.photo_url && (
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input type="checkbox" name="remove_photo" /> Remove current photo
                  </label>
                )}
                <SubmitButton pendingText="Saving..." className={btn}>
                  Save changes
                </SubmitButton>
              </form>
            </details>

            <form action={deleteEvent} className="mt-3">
              <PendingOverlay text="Deleting..." />
              <input type="hidden" name="id" value={e.id} />
              <SubmitButton pendingText="Deleting..." className="text-sm font-semibold text-red-600 hover:underline">
                Delete
              </SubmitButton>
            </form>
          </Card>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-500">No events added yet.</p>}
      </div>
    </div>
  );
}