// Path: app/about/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  AcademicCapIcon,
  EyeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import Cta from '@/components/Cta';
import Leadership from '@/components/Leadership';
import { getLeaderMessages } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About | Manipur Optometrist Association',
  description: 'Who we are, what we stand for and who leads the Manipur Optometrist Association.',
};

// Leader messages are edited from the admin panel, so always read fresh
export const dynamic = 'force-dynamic';

const values = [
  {
    Icon: AcademicCapIcon,
    title: 'Professionalism',
    text: 'High, consistent standards of practice and continuing education for every member.',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'Integrity',
    text: 'Ethical, transparent care that patients and the public can trust.',
  },
  {
    Icon: EyeIcon,
    title: 'Vision',
    text: 'A future where quality eye care is within reach of everyone in Manipur.',
  },
];

const work = [
  ['Member registration', 'A professional register of optometrists practising in Manipur.'],
  ['CME programs', 'Continuing medical education, workshops and training.'],
  ['Regional summits', 'Gatherings that connect practitioners, students and stakeholders.'],
  ['Key projects', 'Screenings and awareness programs for schools and communities.'],
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

function SectionHead({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div>
      {eyebrow && (
        <div className="text-sm font-bold uppercase tracking-widest text-brand">{eyebrow}</div>
      )}
      <h2 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">{title}</h2>
    </div>
  );
}

export default async function AboutPage() {
  const messages = await getLeaderMessages();

  return (
    <>
      {/* About + Who we are (combined) */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="wrap grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[340px_1fr] lg:gap-16">
          <div className="mx-auto grid w-full max-w-xs place-items-center rounded-3xl border border-line bg-tint p-8 shadow-sm">
            <Image
              src="/logo.jpg"
              alt="Manipur Optometrist Association logo"
              width={320}
              height={311}
              priority
              className="h-auto w-48 rounded-xl lg:w-60"
            />
          </div>

          <div>
            

            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
              About the association
            </h1>
            <div className="text-sm font-bold uppercase tracking-widest text-brand">
              Who we are &middot; Established 2020
            </div>

            {/* <p className="mt-5 max-w-2xl font-display text-xl font-bold leading-snug text-ink md:text-2xl">
              The professional body for optometrists in Manipur, working for ethical practice and better eye
              care since 2020.
            </p> */}

            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              The Manipur Optometrist Association (MOA) was established in 2020 to advance standardised,
              ethical optometry across the state. We bring together optometrists, eye-care practitioners,
              students and stakeholders, and connect them with the public they serve.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Cta href="/membership">Become a member</Cta>
              <Cta href="/contact" variant="ghost">Contact us</Cta>
            </div>
          </div>
        </div>
      </section>

      

      {/* Values */}
      <section className="wrap py-14 md:py-20">
        <SectionHead eyebrow="Our principles" title="What we stand for" />

        <div className="mt-8 grid divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
          {values.map(({ Icon, title, text }) => (
            <div key={title} className="p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-tint text-brand">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-brand-dark">{title}</h3>
              <p className="mt-2 leading-7 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Messages from our leaders (managed in Admin > Leader messages) */}
      {messages.length > 0 && (
        <section className="border-y border-line bg-tint">
          <div className="wrap py-14 md:py-20">
            <SectionHead eyebrow="Words from the team" title="Message from our leaders" />

            <div className="mt-10 space-y-8">
              {messages.map((m) => (
                <article
                  key={m.id}
                  className="grid gap-8 rounded-3xl border border-l-4 border-line border-l-brand bg-white p-6 shadow-sm md:grid-cols-[200px_1fr] md:gap-10 md:p-10"
                >
                  {/* Person */}
                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        className="h-40 w-40 rounded-2xl object-cover shadow-sm md:h-48 md:w-48"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="grid h-40 w-40 place-items-center rounded-2xl bg-tint font-display text-5xl font-extrabold text-brand md:h-48 md:w-48"
                      >
                        {initials(m.name)}
                      </div>
                    )}

                    <div className="mt-5 font-display text-xl font-bold text-brand-dark">{m.name}</div>
                    {m.role && (
                      <div className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand">
                        {m.role}
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="block font-display text-7xl font-extrabold leading-none text-brand"
                    >
                      &ldquo;
                    </span>
                    <p className="-mt-3 whitespace-pre-line text-lg leading-8 text-ink md:text-xl md:leading-9">
                      {m.message}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What we do */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-14 md:py-20">
          <SectionHead eyebrow="Our work" title="What we do" />

          <ul className="mt-8 grid gap-x-12 md:grid-cols-2">
            {work.map(([title, text], i) => (
              <li key={title} className="flex gap-5 border-b border-line py-6">
                <span className="font-display text-3xl font-extrabold leading-none text-brand">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-1 leading-7 text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Leadership */}
      <section className="wrap py-14 text-center md:py-20">
        <SectionHead eyebrow="The team" title="Our leadership" />
        <div className="mt-8">
          <Leadership />
        </div>
      </section>

      {/* Contact */}
      <section className="wrap pb-16 md:pb-24">
        <div className="on-dark flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-dark p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Get in touch</h2>
            <p className="mt-3 leading-7 text-white/80">
              Singjamei Chirom Leikai, Imphal West, Manipur – 795008
              <br />
              8259872236 · 7709601772
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Cta href="/membership" variant="mint">Become a member</Cta>
            <Cta href="/contact" variant="ghost">Contact us</Cta>
          </div>
        </div>
      </section>
    </>
  );
}