import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { inr } from '@/lib/format';
import { REGISTRATIONS, REG_TYPES } from './config';

export const metadata: Metadata = {
  title: 'Registrations | MOA',
  description: 'Register your institute, student profile or eye care clinic with MOA.',
};

export default function RegisterHub() {
  return (
    <>
      <PageHero
        align="center"
        title="Register with MOA"
        subtitle="Choose the registration that applies to you."
      />
      <section className="wrap py-14 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REG_TYPES.map((t) => {
            const c = REGISTRATIONS[t];
            return (
              <Link
                key={t}
                href={`/register/${t}`}
                className="rounded-3xl border border-line bg-white p-6 transition-colors hover:border-brand hover:bg-tint"
              >
                <h2 className="font-display text-xl font-bold">{c.title}</h2>
                <p className="mt-2 text-muted">{c.blurb}</p>
                <p className="mt-4 font-display text-2xl font-bold">{inr(c.fee)}</p>
                <p className="mt-2 text-sm font-semibold text-brand">Register →</p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}