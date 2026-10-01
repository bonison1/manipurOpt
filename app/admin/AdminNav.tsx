// Path: app/admin/AdminNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RefreshOnShow from '@/components/RefreshOnShow';
import { logout } from './login/actions';

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/application', label: 'Applications' },
  { href: '/admin/leadership', label: 'Leadership' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/admins', label: 'Admins' },
];

export default function AdminNav({ email }: { email?: string | null }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-sm">
      {/* After Sign out, Back must not show an old admin page: re-check on the server */}
      <RefreshOnShow />
      <nav className="flex flex-wrap gap-1 font-semibold">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l.href, l.exact) ? 'page' : undefined}
            className={
              isActive(l.href, l.exact)
                ? 'rounded-lg bg-[#0d9488]/10 px-3 py-1.5 text-[#0d9488]'
                : 'rounded-lg px-3 py-1.5 text-[#073b66] transition hover:bg-slate-100 hover:text-[#0d9488]'
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <form action={logout} className="flex items-center gap-3">
        <span className="hidden text-slate-500 sm:inline">{email}</span>
        <button
          type="submit"
          className="rounded-lg border px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}