import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { adminLogout } from '@/app/membership-admin/actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <Link href="/membership-admin" className="text-xl font-black text-[#073b66]">
          Membership admin
        </Link>
        <form action={adminLogout} className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">{user.email}</span>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}