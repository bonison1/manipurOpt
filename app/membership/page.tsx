// Path: app/membership/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import Cta from '@/components/Cta';
import { PageHero } from '@/components/PageHero';
import { REGISTRATIONS, REG_TYPES } from '@/app/register/config';
import { MEMBERSHIP_FEE } from './constants';
import { inr } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Membership | MOA',
  description:
    'Join the professional optometry community across Manipur. Register as a practitioner, student, clinic or institution.',
};

const benefits = [
  'Professional networking',
  'CME access',
  'Workshops and conferences',
  'Professional updates',
  'Community participation',
  'Career opportunities',
  'Association resources',
  'Professional recognition',
];

// Practitioner uses the existing application flow; the rest come from the register config
const registrationOptions: { key: string; title: string; blurb: string; fee: string; href: string }[] = [
  {
    key: 'practitioner',
    title: 'Practitioner membership',
    blurb: 'For qualified optometrists practising in or from Manipur.',
    fee: inr(MEMBERSHIP_FEE),
    href: '/membership/apply',
  },
  ...REG_TYPES.map((t) => ({
    key: t,
    title: REGISTRATIONS[t].title,
    blurb: REGISTRATIONS[t].blurb,
    fee: inr(REGISTRATIONS[t].fee),
    href: `/register/${t}`,
  })),
];

const processSteps = [
  {
    title: 'Fill in the application form',
    description:
      'Complete the step-by-step form with your personal, work and educational details. Fields marked * are required.',
  },
  {
    title: 'Merge your documents into one PDF',
    description: 'Combine everything listed on the right into a single PDF of up to 10MB and upload it.',
  },
  {
    title: 'Review and submit',
    description: 'Check your answers, accept the consent declaration and submit.',
  },
  {
    title: 'Save your registration number',
    description:
      'You receive a registration number immediately. Keep it safe: you need it with your email to track your application.',
  },
  {
    title: 'Pay the membership fee',
    description:
      'Pay through the association’s payment account (QR or bank transfer) and upload your transaction ID and receipt (JPEG, JPG, JPE or PDF).',
  },
  {
    title: 'Verification and approval',
    description:
      'The association verifies your documents and payment, then approves your membership. Track progress any time on the tracking page.',
  },
];

const requiredDocuments = [
  'Passport-size photograph',
  'Aadhaar card',
  'Birth certificate',
  'HS Science marksheet',
  'All B.Optom marksheets',
  'Internship completion certificate',
  'B.Optom degree certificate',
];

export default function Membership() {
  return (
    <>
      <PageHero
        align="center"
        title="Become part of Manipur’s optometry community"
        subtitle="Connect, learn, contribute and grow with optometry professionals across Manipur."
      >
        <Cta href="#registrations">Register now</Cta>
        <Cta href="/membership/login" variant="ghost">Member login</Cta>
      </PageHero>

      {/* Choose a registration */}
      <section id="registrations" aria-labelledby="registrations-title" className="wrap scroll-mt-32 py-14 md:py-20">
        <div className="text-center">
          <h2 id="registrations-title" className="font-display text-2xl font-bold md:text-3xl">
            Choose your registration
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            Pick the option that fits you. Each one has its own short application.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {registrationOptions.map((o) => (
            <div key={o.key} className="flex flex-col rounded-3xl border border-line bg-white p-6">
              <h3 className="font-display text-lg font-bold">{o.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">{o.blurb}</p>
              <p className="mt-4 font-display text-2xl font-bold">{o.fee}</p>
              <Cta href={o.href} className="mt-5 w-full">
                Register
              </Cta>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already a member?{' '}
          <Link href="/membership/login" className="font-semibold text-brand underline">
            Log in
          </Link>{' '}
          or{' '}
          <Link href="/membership/track" className="font-semibold text-brand underline">
            track your application
          </Link>
          .
        </p>
      </section>

      {/* Benefits */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-14 md:py-20">
          <h2 className="text-center font-display text-2xl font-bold md:text-3xl">Membership benefits</h2>
          <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 border-b border-line py-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tint text-brand">
                  <CheckIcon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process (practitioner membership) */}
      <section id="process" className="wrap py-14 md:py-20">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">How to apply as a practitioner</h2>
          <p className="mt-2 text-muted">Six short steps, from application to approval.</p>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-3">
          <ol className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white lg:col-span-2">
            {processSteps.map((step, i) => (
              <li key={step.title} className="flex gap-4 p-5 md:p-6">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tint font-display font-bold text-brand-dark"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 leading-7 text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside className="rounded-3xl border border-line bg-tint p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-bold">Documents to keep ready</h3>
            <p className="mt-1 text-sm text-muted">Merged into a single PDF (max 10MB)</p>
            <ul className="mt-4 space-y-2.5">
              {requiredDocuments.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-5 text-muted">
              The membership fee ({inr(MEMBERSHIP_FEE)}) is non-refundable. Registration is subject to
              document verification and approval.
            </p>
            <Cta href="#registrations" className="mt-5 w-full">Register now</Cta>
          </aside>
        </div>
      </section>

      {/* Closing call to action */}
      <section aria-labelledby="register-cta" className="wrap pb-16 md:pb-24">
        <div className="on-dark flex flex-col items-start justify-between gap-8 rounded-3xl bg-brand-dark p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 id="register-cta" className="font-display text-3xl font-bold leading-tight md:text-4xl">
              Ready to join?
            </h2>
            <p className="mt-3 max-w-md leading-7 text-white/80">
              Keep your documents and payment receipt ready, then start your registration.
            </p>
            <p className="mt-4 text-sm text-white/70">
              Already applied?{' '}
              <Link href="/membership/track" className="font-semibold text-white underline">
                Track your application
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Cta href="#registrations" variant="mint">Register now</Cta>
            <Cta href="/membership/login" variant="ghost">Member login</Cta>
          </div>
        </div>
      </section>
    </>
  );
}