// Path: components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';

// Path: components/Footer.tsx  (replace the links array)
const links = [
  ['About', '/about'],
  ['Membership', '/membership'],
  // ['Events', '/events'],
  // ['Projects', '/projects'],
  ['Gallery', '/gallery'],
  ['Contact', '/contact'],
  ['Admin', '/admin/login'],
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="wrap grid gap-8 py-12 md:grid-cols-2">
        
        <div className="flex gap-4">
          <Image
            src="/logo.jpg"
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 object-contain"
          />
          <div>
            <div className="font-display text-lg font-bold">Manipur Optometrist Association</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Singjamei Chirom Leikai, Imphal West, Manipur – 795008
              <br />
              8259872236 · 7709601772
            </p>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap content-start gap-x-6 gap-y-2 text-sm text-muted md:justify-end">
          {links.map(([name, href]) => (
            <Link key={href} href={href} className="hover:text-brand hover:underline">
              {name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="wrap py-5 text-xs text-muted">© 2026 Manipur Optometrist Association</div>
      </div>
    </footer>
  );
}