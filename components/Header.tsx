'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  HomeIcon,
  InformationCircleIcon,
  UserGroupIcon,
  PhotoIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { memberLogout } from '@/app/membership/auth-actions';
import { logout as adminLogout } from '@/app/admin/login/actions';
import type { Me } from '@/lib/auth/get-me';

const links = [
  ['Home', '/', HomeIcon],
  ['About', '/about', InformationCircleIcon],
  ['Membership', '/membership', UserGroupIcon],
  // ['Events', '/events', CalendarDaysIcon],
  // ['Projects', '/projects', BriefcaseIcon],
  // ['News', '/news', BellIcon],
  ['Gallery', '/gallery', PhotoIcon],
  ['Contact', '/contact', PhoneIcon],
] as const;

// Where "Login" goes when nobody is signed in (members log in here; admins use /admin/login)
const LOGIN_HREF = '/membership/login';

const HINT_KEY = 'moa-auth-hint'; // remembers the last state so the header doesn't flash on reload

export default function Header({ initialMe }: { initialMe?: Me }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me>(initialMe ?? null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // The server already told us who is signed in; keep following it when the layout re-renders
  useEffect(() => {
    if (initialMe !== undefined) setMe(initialMe);
  }, [initialMe]);

  // Without server info, show the last known state straight away...
  useEffect(() => {
    if (initialMe !== undefined) return;
    try {
      const hint = localStorage.getItem(HINT_KEY);
      if (hint) setMe(JSON.parse(hint));
    } catch {
      /* storage unavailable */
    }
  }, []);

  // ...then confirm with the server. Re-checks on every page change, when the tab regains focus,
  // when the page is restored via back/forward, and when a login form announces a change.
  useEffect(() => {
    let cancelled = false;

    const sync = () => {
      fetch('/api/auth/me', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          const next: Me = d?.role ? { role: d.role, name: d.name } : null;
          setMe(next);
          try {
            if (next) localStorage.setItem(HINT_KEY, JSON.stringify(next));
            else localStorage.removeItem(HINT_KEY);
          } catch {
            /* storage unavailable */
          }
        })
        .catch(() => {});
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };

    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    window.addEventListener('moa-auth-changed', sync);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('moa-auth-changed', sync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pathname]);

  // Switch the header back to "Login" straight away when someone logs out
  const clearMe = () => {
    setMe(null);
    try {
      localStorage.removeItem(HINT_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const active = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  const profileHref = me?.role === 'admin' ? '/admin' : '/membership/dashboard';
  const profileLabel = me?.role === 'admin' ? 'Admin' : 'Profile';
  const logoutAction = me?.role === 'admin' ? adminLogout : memberLogout;
  const initial = (me?.name?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top row: logo left, actions right */}
      <div className="wrap flex h-20 items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/logo.jpg"
            alt="Manipur Optometrist Association logo"
            width={56}
            height={56}
            priority
            className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
          />
          <span className="border-l border-ink/30 pl-2 font-serif text-[10px] font-semibold uppercase leading-snug sm:pl-3 sm:text-sm">
            Manipur Optometrist
            <br />
            Association
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {me ? (
            <>
              <Link
                href={profileHref}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-dark px-3 py-2 text-xs font-semibold text-white hover:bg-brand sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-brand-dark">
                  {initial}
                </span>
                <span className="hidden sm:inline">{profileLabel}</span>
              </Link>
              <form action={logoutAction} onSubmit={clearMe} className="hidden sm:block">
                <button
                  type="submit"
                  className="rounded-lg border border-brand-dark px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-tint"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href={LOGIN_HREF}
                className="hidden rounded-lg border border-brand-dark px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-tint sm:block"
              >
                Login
              </Link>
              <Link
                href="/membership"
                className="whitespace-nowrap rounded-lg bg-brand-dark px-3 py-2 text-xs font-semibold text-white hover:bg-brand sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Become a member</span>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="grid h-9 w-9 place-items-center rounded-lg bg-brand-dark text-white sm:h-10 sm:w-10 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Solid nav bar (desktop) */}
      <nav className="hidden bg-brand-dark lg:block" aria-label="Main">
        <div className="wrap flex items-center gap-1">
          {links.map(([name, href, Icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? 'page' : undefined}
              className={`flex items-center gap-2 px-5 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 ${
                active(href) ? 'bg-white/15' : ''
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile nav */}
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="bg-brand-dark lg:hidden">
          <div className="wrap py-2">
            {links.map(([name, href, Icon]) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? 'page' : undefined}
                className={`flex items-center gap-3 border-b border-white/10 py-4 font-semibold text-white ${
                  active(href) ? 'text-white' : 'text-white/90'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {name}
              </Link>
            ))}

            {me ? (
              <form action={logoutAction} onSubmit={clearMe}>
                <button type="submit" className="w-full py-4 text-left text-white/80">
                  Log out
                </button>
              </form>
            ) : (
              <Link href={LOGIN_HREF} className="block py-4 text-white/80">
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}