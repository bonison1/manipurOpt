// Path: components/Header.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cta from '@/components/Cta';

// Path: components/Header.tsx  (replace the links array)
const links = [
  ['About', '/about'],
  // ['Events', '/events'],
  // ['Projects', '/projects'],
  // ['News', '/news'],
  ['Gallery', '/gallery'],
  ['Contact', '/contact'],
];

// CHANGE if you later add a separate member login page
const LOGIN_HREF = '/admin/login';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Manipur Optometrist Association logo"
            width={44}
            height={44}
            priority
            className="h-11 w-11 object-contain"
          />
          <span className="hidden text-sm font-semibold leading-tight sm:block">
            Manipur Optometrist
            <br />
            Association
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active(href) ? 'bg-tint text-brand-dark' : 'text-ink/80 hover:bg-tint'
              }`}
            >
              {name}
            </Link>
          ))}
          {/* <Link href={LOGIN_HREF} className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:bg-tint">
            Login
          </Link> */}
          <Cta href="/membership" className="ml-2 !px-5 !py-2.5">Become a member</Cta>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-white lg:hidden">
          <div className="wrap py-4">
            {links.map(([name, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? 'page' : undefined}
                className={`block border-b border-line py-4 font-display text-xl font-bold ${
                  active(href) ? 'text-brand' : ''
                }`}
              >
                {name}
              </Link>
            ))}
            <Link href={LOGIN_HREF} className="block py-4 text-muted">
              Login
            </Link>
            <Cta href="/membership" className="w-full">Become a member</Cta>
          </div>
        </nav>
      )}
    </header>
  );
}