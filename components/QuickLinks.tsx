//components/QuickLinks.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

type NavLink = { name: string; href: string };
type NavItem = NavLink | { name: string; children: NavLink[] };

const items: NavItem[] = [
  { name: 'Home', href: '/' },
  {
    name: 'About',
    children: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Gallery', href: '/gallery' },
    ],
  },
  {
    name: 'Membership',
    children: [
      { name: 'New Registration', href: '/membership/apply' },
      { name: 'Member Login', href: '/membership/login' }, // <-- change to your real login route
      { name: 'Track Application', href: '/membership/track' },
    ],
  },
  { name: 'Admin', href: '/admin/login' },
];

function Dropdown({ name, children }: { name: string; children: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 hover:text-blue-300"
      >
        {name}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2 border-l border-white/20 pl-4 text-base text-white/80">
          {children.map((c) => (
            <Link key={c.href} href={c.href} className="hover:text-blue-300">
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuickLinks() {
  return (
    <nav aria-label="Footer" className="mt-6 flex flex-col gap-3 text-lg">
      {items.map((item) =>
        'children' in item ? (
          <Dropdown key={item.name} name={item.name} children={item.children} />
        ) : (
          <Link key={item.href} href={item.href} className="hover:text-blue-300">
            {item.name}
          </Link>
        )
      )}
    </nav>
  );
}