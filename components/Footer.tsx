//components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import QuickLinks from './QuickLinks';

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-xl font-bold">{children}</h3>
      <div className="mt-2 h-1 w-14 rounded bg-blue-500" />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="wrap grid gap-12 py-14 md:grid-cols-[1.2fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <Image
            src="/logo.jpg"
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 rounded-full bg-white object-contain p-1"
          />
          <p className="mt-6 max-w-sm text-lg leading-8 text-white/90">
            Advancing optometry, improving vision and serving the people of Manipur.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <Heading>Quick Links</Heading>
          <QuickLinks />
        </div>

        {/* Contact */}
        <div>
          <Heading>Contact</Heading>
          <div className="mt-6 space-y-5">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/10 text-blue-300">
                <MapPinIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <div className="font-semibold">Address</div>
                <p className="text-white/80">
                  Singjamei Chirom Leikai, Imphal West, Manipur – 795008
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/10 text-blue-300">
                <PhoneIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <div className="font-semibold">Phone</div>
                <p className="text-white/80">8259872236 · 7709601772</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="wrap flex flex-col justify-between gap-3 py-6 text-sm text-white/80 sm:flex-row">
          <span>© 2026 Manipur Optometrist Association. All rights reserved.</span>
          {/* Remove these two links if you don't have the pages yet */}
          <span className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}