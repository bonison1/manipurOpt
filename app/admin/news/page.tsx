// Path: app/admin/news/page.tsx
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getLatestNews } from '@/lib/content';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';
import AdminNav from '../AdminNav';
import { addNews, deleteNews, updateNews } from './actions';

export const dynamic = 'force-dynamic';

const input = 'w-full rounded-lg border px-3 py-2 text-sm';
const btn = 'rounded-lg bg-[#073b66] px-3 py-2 text-sm font-semibold text-white';

export default async function AdminNews({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const items = await getLatestNews();

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">News</h1>
      <p className="mt-2 text-slate-500">Write, edit or delete announcements.</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      {/* Add */}
      <Card>
        <form action={addNews} className="space-y-3">
          <PendingOverlay text="Publishing..." />
          <div className="grid gap-3 sm:grid-cols-3">
            <input name="title" required placeholder="Headline" className={`${input} sm:col-span-2`} />
            <input name="published_at" type="date" className={input} />
            <input name="category" placeholder="Category (e.g. Announcement)" className={input} />
          </div>
          <textarea name="summary" rows={2} placeholder="Short summary (shown on the homepage)" className={input} />
          <textarea name="body" rows={8} placeholder="Full article" className={input} />
          <SubmitButton pendingText="Publishing..." className={btn}>
            Publish news
          </SubmitButton>
        </form>
      </Card>

      {/* List */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((n) => (
          <Card key={n.id}>
            <div className="text-xs font-semibold text-slate-400">
              {n.published_at} {n.category && `· ${n.category}`}
            </div>
            <div className="mt-1 font-bold text-[#073b66]">{n.title}</div>
            {n.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{n.summary}</p>}

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#073b66] hover:underline">
                Edit
              </summary>
              <form action={updateNews} className="mt-3 space-y-2">
                <PendingOverlay text="Saving changes..." />
                <input type="hidden" name="id" value={n.id} />
                <input name="title" required defaultValue={n.title} className={input} />
                <input name="published_at" type="date" defaultValue={n.published_at} className={input} />
                <input name="category" defaultValue={n.category ?? ''} placeholder="Category" className={input} />
                <textarea name="summary" rows={2} defaultValue={n.summary ?? ''} className={input} />
                <textarea name="body" rows={8} defaultValue={n.body ?? ''} className={input} />
                <SubmitButton pendingText="Saving..." className={btn}>
                  Save changes
                </SubmitButton>
              </form>
            </details>

            <form action={deleteNews} className="mt-3">
              <PendingOverlay text="Deleting..." />
              <input type="hidden" name="id" value={n.id} />
              <SubmitButton pendingText="Deleting..." className="text-sm font-semibold text-red-600 hover:underline">
                Delete
              </SubmitButton>
            </form>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">No news added yet.</p>}
      </div>
    </div>
  );
}