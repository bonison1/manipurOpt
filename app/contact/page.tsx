// Path: app/contact/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPinIcon, PhoneIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { ContactForm } from '@/components/ContactForm';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Contact | Manipur Optometrist Association',
  description: 'Reach the Manipur Optometrist Association in Imphal West.',
};

const phones = [
  ['8259872236', '+918259872236'],
  ['7709601772', '+917709601772'],
];

const mapsHref =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Singjamei Chirom Leikai, Imphal West, Manipur 795008');

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact us"
        subtitle="Questions about membership, CME or projects? Send us a message or call the office."
      />

      <section className="wrap grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_1.1fr]">
        {/* Details */}
        <div className="space-y-4">
          <div className="flex gap-4 rounded-3xl border border-line bg-white p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tint text-brand">
              <MapPinIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Address</h2>
              <p className="mt-1 leading-7 text-muted">
                Singjamei Chirom Leikai, Imphal West,
                <br />
                Manipur – 795008
              </p>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="flex gap-4 rounded-3xl border border-line bg-white p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tint text-brand">
              <PhoneIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Phone</h2>
              <ul className="mt-1 space-y-1">
                {phones.map(([label, tel]) => (
                  <li key={tel}>
                    <a href={`tel:${tel}`} className="text-lg font-semibold hover:text-brand hover:underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-4 rounded-3xl border border-line bg-white p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tint text-brand">
              <UserPlusIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Want to join?</h2>
              <p className="mt-1 leading-7 text-muted">Register as a member from the membership page.</p>
              <Link
                href="/membership"
                className="mt-2 inline-block text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
              >
                Become a member
              </Link>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-line bg-white p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold">Send a message</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}