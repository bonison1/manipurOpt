// Path: app/admin/AdminNav.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RefreshOnShow from '@/components/RefreshOnShow';
import { logout } from './login/actions';

type NavLink = { href: string; label: string; exact?: boolean };
type NavGroup = { label: string; items: NavLink[] };
type NavEntry = NavLink | NavGroup;

const isGroup = (e: NavEntry): e is NavGroup => 'items' in e;

const entries: NavEntry[] = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/application', label: 'Applications' },
  {
    label: 'Leadership',
    items: [
      { href: '/admin/leadership', label: 'Leadership' },
      { href: '/admin/leader-messages', label: 'Leader messages' },
    ],
  },
  {
    label: 'Gallery & Hero',
    items: [
      { href: '/admin/gallery', label: 'Gallery' },
      { href: '/admin/hero', label: 'Hero image' },
      // { href: '/admin/banner', label: 'Banner' },
    ],
  },
  {
    label: 'Events & News',
    items: [
      { href: '/admin/events', label: 'Events' },
      { href: '/admin/news', label: 'News' },
    ],
  },
  { href: '/admin/admins', label: 'Admins' },
];

const baseItem = 'rounded-lg px-3 py-1.5 transition';
const activeItem = 'bg-[#0d9488]/10 text-[#0d9488]';
const idleItem = 'text-[#073b66] hover:bg-slate-100 hover:text-[#0d9488]';

export default function AdminNav({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  // Close dropdown when route changes
  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  // Close on outside click / Escape
  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroup(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-sm">
      {/* After Sign out, Back must not show an old admin page: re-check on the server */}
      <RefreshOnShow />
      <nav ref={navRef} className="flex flex-wrap gap-1 font-semibold">
        {entries.map((entry) => {
          if (!isGroup(entry)) {
            const active = isActive(entry.href, entry.exact);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={active ? 'page' : undefined}
                className={`${baseItem} ${active ? activeItem : idleItem}`}
              >
                {entry.label}
              </Link>
            );
          }

          const groupActive = entry.items.some((i) => isActive(i.href, i.exact));
          const open = openGroup === entry.label;

          return (
            <div key={entry.label} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpenGroup(open ? null : entry.label)}
                className={`${baseItem} flex items-center gap-1 ${
                  groupActive || open ? activeItem : idleItem
                }`}
              >
                {entry.label}
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-1 min-w-[11rem] rounded-lg border bg-white p-1 shadow-lg"
                >
                  {entry.items.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        aria-current={active ? 'page' : undefined}
                        className={`block ${baseItem} ${active ? activeItem : idleItem}`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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