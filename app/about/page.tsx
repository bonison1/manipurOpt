// Path: app/about/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Cta from '@/components/Cta';
import Leadership from '@/components/Leadership';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'About | Manipur Optometrist Association',
  description: 'Who we are, what we stand for and who leads the Manipur Optometrist Association.',
};

const values = [
  ['Professionalism', 'High, consistent standards of practice and continuing education for every member.'],
  ['Integrity', 'Ethical, transparent care that patients and the public can trust.'],
  ['Vision', 'A future where quality eye care is within reach of everyone in Manipur.'],
];

const work = [
  ['Member registration', 'A professional register of optometrists practising in Manipur.'],
  ['CME programs', 'Continuing medical education, workshops and training.'],
  ['Regional summits', 'Gatherings that connect practitioners, students and stakeholders.'],
  ['Key projects', 'Screenings and awareness programs for schools and communities.'],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About the association"
        subtitle="The professional body for optometrists in Manipur, working for ethical practice and better eye care since 2020."
      />

      {/* Who we are */}
      <section className="wrap grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[320px_1fr]">
        <Image
          src="/logo.jpg"
          alt="Manipur Optometrist Association logo"
          width={320}
          height={311}
          className="mx-auto h-auto w-56 lg:w-80"
        />
        <div>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Who we are</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            The Manipur Optometrist Association (MOA) was established in 2020 to advance standardised, ethical
            optometry across the state. We bring together optometrists, eye-care practitioners, students and
            stakeholders, and connect them with the public they serve.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="wrap pb-14 md:pb-20">
        <h2 className="font-display text-2xl font-bold md:text-3xl">What we stand for</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {values.map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-line bg-white p-6">
              <h3 className="font-display text-xl font-bold text-brand-dark">{title}</h3>
              <p className="mt-2 leading-7 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-14 md:py-20">
          <h2 className="font-display text-2xl font-bold md:text-3xl">What we do</h2>
          <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
            {work.map(([title, text]) => (
              <li key={title} className="border-b border-line py-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 leading-7 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Leadership */}
      <section className="wrap py-14 text-center md:py-20">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Our leadership</h2>
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