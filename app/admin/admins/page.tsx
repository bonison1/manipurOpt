// Path: app/admin/admins/page.tsx
import type { Metadata } from 'next';
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { bootstrapAdminEmails } from '@/lib/auth/admin-emails';
import AdminNav from '../AdminNav';
import AddAdminForm from './AddAdminForm';
import { removeAdmin } from './actions';

export const metadata: Metadata = { title: 'Manage Admins | MOA' };
export const dynamic = 'force-dynamic';

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function ManageAdminsPage() {
  const me = await requireAdmin();
  const myEmail = me.email?.toLowerCase();

  const owners = bootstrapAdminEmails();
  const { data } = await createAdminClient()
    .from('admins')
    .select('email, added_by, created_at')
    .order('created_at', { ascending: true });

  const admins = (data ?? []).filter((a) => !owners.includes(a.email));
  const total = owners.length + admins.length;

  return (
    <div className="container py-12">
      <AdminNav email={me.email} />

      <div className="mx-auto grid max-w-2xl gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-black text-[#073b66]">Manage admins</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Admins can verify applications, manage content and add or remove other admins.
          </p>
        </header>

        <Card>
          <h2 className="text-lg font-bold text-[#073b66]">Add an admin</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">
            Enter their email. Set a temporary password if they don&apos;t have an account yet.
          </p>
          <AddAdminForm />
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#073b66]">Current admins</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {total} {total === 1 ? 'admin' : 'admins'}
            </span>
          </div>

          <ul className="divide-y divide-slate-200">
            {owners.map((email) => (
              <li key={email} className="flex items-center gap-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#073b66] text-xs font-bold text-white">
                  {initials(email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {email}
                    {email === myEmail && <span className="ml-2 font-normal text-slate-500">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-500">Managed in environment settings</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Owner
                </span>
              </li>
            ))}

            {admins.map((a) => (
              <li key={a.email} className="flex items-center gap-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d9488]/10 text-xs font-bold text-[#0d9488]">
                  {initials(a.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {a.email}
                    {a.email === myEmail && <span className="ml-2 font-normal text-slate-500">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {a.added_by ? `Added by ${a.added_by}` : 'Added'} · {formatDate(a.created_at)}
                  </p>
                </div>
                {a.email === myEmail ? (
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Admin
                  </span>
                ) : (
                  <form action={removeAdmin}>
                    <input type="hidden" name="email" value={a.email} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}

            {total === 0 && <li className="py-6 text-center text-sm text-slate-500">No admins yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}