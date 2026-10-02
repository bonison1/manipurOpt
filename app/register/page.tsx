//Users/macbook/Downloads/moa-website/app/register/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { PageHero } from '@/components/PageHero';
import { inr } from '@/lib/format';
import { REGISTRATIONS, REG_TYPES } from './config';
import { BENEFIT_GROUPS } from './benefits';

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

      {/* Registration types */}
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

      {/* Benefits */}
      {BENEFIT_GROUPS.map((group, i) => (
        <section
          key={group.id}
          id={group.id}
          aria-labelledby={`${group.id}-benefits`}
          className={i % 2 === 0 ? 'border-y border-line bg-white' : ''}
        >
          <div className="wrap py-14 md:py-20">
            <h2
              id={`${group.id}-benefits`}
              className="text-center font-display text-2xl font-bold md:text-3xl"
            >
              {group.heading}
            </h2>
            <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
              {group.benefits.map((b) => (
                <li key={b.title} className="flex items-start gap-3 border-b border-line py-4">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tint text-brand">
                    <CheckIcon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{b.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <p className="wrap pb-16 text-center text-xs text-muted md:pb-24">
        Benefits are subject to association rules and policies. Registration fees are non-refundable.
      </p>
    </>
  );
}