// Path: app/admin/leader-messages/page.tsx
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getLeaderMessages } from '@/lib/content';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';
import AdminNav from '../AdminNav';
import { addLeaderMessage, deleteLeaderMessage, updateLeaderMessage } from './actions';

export const dynamic = 'force-dynamic';

const input = 'w-full rounded-lg border px-3 py-2 text-sm';
const btn = 'rounded-lg bg-[#073b66] px-3 py-2 text-sm font-semibold text-white';

export default async function AdminLeaderMessages({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const messages = await getLeaderMessages();

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Leader messages</h1>
      <p className="mt-2 text-slate-500">
        Messages from the President and other office bearers, shown on the About page. Photo is optional (under 1 MB).
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      {/* Add */}
      <Card>
        <form action={addLeaderMessage} className="space-y-3">
          <PendingOverlay text="Adding message..." />
          <div className="grid gap-3 sm:grid-cols-3">
            <input name="name" required placeholder="Full name" className={input} />
            <input name="role" placeholder="Position (e.g. President)" className={input} />
            <input name="sort_order" type="number" defaultValue={0} placeholder="Order" className={input} />
          </div>
          <textarea name="message" required rows={6} placeholder="Message" className={input} />
          <label className="block text-xs text-slate-500">
            Photo (optional, under 1 MB)
            <input name="photo" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
          </label>
          <SubmitButton pendingText="Adding..." className={btn}>
            Add message
          </SubmitButton>
        </form>
      </Card>

      {/* List */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {messages.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center gap-3">
              {m.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo_url} alt={m.name} className="h-14 w-14 rounded-full object-cover" />
              )}
              <div>
                <div className="font-bold text-[#073b66]">{m.name}</div>
                <div className="text-sm text-slate-500">
                  {m.role} <span className="text-slate-400">· Order {m.sort_order}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">{m.message}</p>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#073b66] hover:underline">
                Edit
              </summary>
              <form action={updateLeaderMessage} className="mt-3 space-y-2">
                <PendingOverlay text="Saving changes..." />
                <input type="hidden" name="id" value={m.id} />
                <input name="name" required defaultValue={m.name} placeholder="Full name" className={input} />
                <input name="role" defaultValue={m.role ?? ''} placeholder="Position" className={input} />
                <input name="sort_order" type="number" defaultValue={m.sort_order} placeholder="Order" className={input} />
                <textarea name="message" required rows={6} defaultValue={m.message} className={input} />
                <label className="block text-xs text-slate-500">
                  Replace photo (optional, under 1 MB)
                  <input name="photo" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
                </label>
                {m.photo_url && (
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input type="checkbox" name="remove_photo" /> Remove current photo
                  </label>
                )}
                <SubmitButton pendingText="Saving..." className={btn}>
                  Save changes
                </SubmitButton>
              </form>
            </details>

            <form action={deleteLeaderMessage} className="mt-3">
              <PendingOverlay text="Deleting..." />
              <input type="hidden" name="id" value={m.id} />
              <SubmitButton pendingText="Deleting..." className="text-sm font-semibold text-red-600 hover:underline">
                Delete
              </SubmitButton>
            </form>
          </Card>
        ))}
        {messages.length === 0 && <p className="text-sm text-slate-500">No messages added yet.</p>}
      </div>
    </div>
  );
}