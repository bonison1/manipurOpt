// Path: app/admin/AdminNav.tsx
import Link from 'next/link';
import { logout } from './login/actions';

export default function AdminNav({ email }: { email?: string | null }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-sm">
      <div className="flex gap-5 font-semibold text-[#073b66]">
        <Link href="/admin" className="hover:text-[#0d9488]">Dashboard</Link>
        <Link href="/admin/application" className="hover:text-[#0d9488]">Applications</Link>
      </div>
      <form action={logout} className="flex items-center gap-3">
        <span className="text-slate-500">{email}</span>
        <button type="submit" className="rounded-lg border px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">
          Sign out
        </button>
      </form>
    </div>
  );
}