import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import UploadForm from '@/components/admin/UploadForm';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';
import AdminNav from '../AdminNav';
import { addLeader, deleteLeader, updateLeader } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminLeadership({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const { data: leaders } = await createAdminClient()
    .from('leadership')
    .select('id, name, role, photo_url, sort_order')
    .order('sort_order')
    .order('created_at');

  const input = 'w-full rounded-lg border px-3 py-2 text-sm';

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Leadership</h1>
      <p className="mt-2 text-slate-500">Add office bearers with a photo (under 1 MB).</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      <Card>
        <UploadForm action={addLeader} submitLabel="Add leader">
          <div className="grid gap-4 sm:grid-cols-3">
            <input name="name" required placeholder="Full name" className={input} />
            <input name="role" placeholder="Position (e.g. President)" className={input} />
            <input name="sort_order" type="number" defaultValue={0} placeholder="Order" className={input} />
          </div>
        </UploadForm>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(leaders ?? []).map((l) => (
          <Card key={l.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.photo_url} alt={l.name} className="aspect-square w-full rounded-lg object-cover" />
            <div className="mt-3 font-bold text-[#073b66]">{l.name}</div>
            <div className="text-sm text-slate-500">
              {l.role} <span className="text-slate-400">· Order {l.sort_order}</span>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#073b66] hover:underline">
                Edit
              </summary>
              <form action={updateLeader} className="mt-3 space-y-2">
                <PendingOverlay text="Saving changes..." />
                <input type="hidden" name="id" value={l.id} />
                <input name="name" required defaultValue={l.name} placeholder="Full name" className={input} />
                <input name="role" defaultValue={l.role ?? ''} placeholder="Position" className={input} />
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={l.sort_order ?? 0}
                  placeholder="Order"
                  className={input}
                />
                <label className="block text-xs text-slate-500">
                  Replace photo (optional, under 1 MB)
                  <input name="photo" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
                </label>
                <SubmitButton
                  pendingText="Saving..."
                  className="rounded-lg bg-[#073b66] px-3 py-2 text-sm font-semibold text-white"
                >
                  Save changes
                </SubmitButton>
              </form>
            </details>

            <form action={deleteLeader} className="mt-3">
              <PendingOverlay text="Deleting..." />
              <input type="hidden" name="id" value={l.id} />
              <SubmitButton
                pendingText="Deleting..."
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Delete
              </SubmitButton>
            </form>
          </Card>
        ))}
        {(leaders ?? []).length === 0 && <p className="text-sm text-slate-500">No leaders added yet.</p>}
      </div>
    </div>
  );
}