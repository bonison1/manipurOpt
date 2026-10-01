// Path: app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import {
  AcademicCapIcon,
  EyeIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

import Cta from '@/components/Cta';
import GalleryBanner from '@/components/GalleryBanner';
import Leadership from '@/components/Leadership';
import { events, news } from '@/lib/data';
import { getGalleryImages } from '@/lib/gallery';

const pillars = [
  {
    Icon: AcademicCapIcon,
    title: 'Professional development',
    text: 'CME, workshops and regional summits for practising optometrists.',
  },
  {
    Icon: EyeIcon,
    title: 'Primary eye care',
    text: 'Ethical, accessible and standardised eye care across the state.',
  },
  {
    Icon: HeartIcon,
    title: 'Community welfare',
    text: 'Screenings and awareness programs for schools and communities.',
  },
];

function dateParts(value: string) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return null;

  return {
    day: d.getDate(),
    month: d.toLocaleString('en-GB', {
      month: 'short',
    }),
  };
}

function PanelHead({ title }: { title: string }) {
  return <h2 className="font-display text-2xl font-bold">{title}</h2>;
}

function ViewAll({
  href,
  children,
  tone = 'brand',
}: {
  href: string;
  children: React.ReactNode;
  tone?: 'brand' | 'red';
}) {
  const c =
    tone === 'red'
      ? 'border-red-600 text-red-600 hover:bg-red-50'
      : 'border-brand text-brand hover:bg-tint';

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 font-bold transition-colors ${c}`}
    >
      {children} <span aria-hidden="true">›</span>
    </Link>
  );
}

export default async function Home() {
  const upcoming = events.slice(0, 3);
  const latest = news.slice(0, 3);

  // Latest 6 gallery photos for the fading banner
  const bannerPhotos = await getGalleryImages(6);

  // Hero photo: uses the newest gallery photo, or /public/hero.jpg if the gallery is empty
  const heroSrc = bannerPhotos[0]?.src ?? '/hero.jpg';

  return (
    <>
      {/* Hero: photo on the right fading into white */}
      <section className="relative overflow-hidden bg-white">
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />

        <div className="wrap relative py-14 md:py-24">
          <Image
            src="/logo1.png"
            alt="Manipur Optometrist Association"
            width={140}
            height={140}
            className="h-28 w-28 object-contain md:h-36 md:w-36"
          />

          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-brand sm:text-5xl md:text-6xl">
            Manipur Optometrist Association
          </h1>

          <p className="mt-5 max-w-2xl font-display text-xl font-bold leading-snug text-ink md:text-3xl">
            Advancing optometry. Improving vision. Serving Manipur.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Cta href="/membership">Become a member</Cta>

            <Cta href="/about" variant="ghost">
              About MOA
            </Cta>
          </div>
        </div>
      </section>

      

      {/* What we do */}
      <section className="wrap pb-16 pt-6 md:pb-20">
        <h2 className="mb-8 text-center font-display text-3xl font-extrabold md:text-4xl">
          What we do
        </h2>

        <div className="grid divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
          {pillars.map(({ Icon, title, text }) => (
            <div key={title} className="p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-tint text-brand">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>

              <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>

              <p className="mt-2 leading-7 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      

      

      {/* Events and news */}
      <section className="wrap grid gap-6 pb-16 md:pb-20 lg:grid-cols-2">
        {/* Events */}
        <div className="rounded-2xl border border-l-4 border-line border-l-brand bg-white p-7 shadow-sm">
          <PanelHead title="Events" />

          {upcoming.length === 0 ? (
            <p className="mt-6 text-muted">
              No upcoming events yet. Check back soon.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {upcoming.map((e) => {
                const p = dateParts(e.date);

                return (
                  <li key={e.id}>
                    <Link
                      href={'/event/' + e.id}
                      className="group flex gap-4 py-4"
                    >
                      {p && (
                        <div className="w-14 shrink-0 rounded-xl bg-tint py-2 text-center text-brand-dark">
                          <div className="font-display text-2xl font-bold leading-none">
                            {p.day}
                          </div>

                          <div className="mt-1 text-xs font-semibold">
                            {p.month}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="font-semibold group-hover:text-brand">
                          {e.title}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
                          <span>{e.type}</span>
                          <span>{e.location}</span>
                          {!p && <span>{e.date}</span>}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6 flex justify-end">
            <ViewAll href="/events">View All Events</ViewAll>
          </div>
        </div>

        {/* News */}
        <div className="rounded-2xl border border-l-4 border-line border-l-red-600 bg-white p-7 shadow-sm">
          <PanelHead title="News" />

          {latest.length === 0 ? (
            <p className="mt-6 text-muted">
              No announcements yet. Check back soon.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {latest.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={'/news/' + n.slug}
                    className="group block py-4"
                  >
                    <div className="text-sm font-medium text-brand">
                      {n.category}
                    </div>

                    <div className="mt-1 font-semibold group-hover:text-brand">
                      {n.title}
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                      {n.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex justify-end">
            <ViewAll href="/news" tone="red">
              View All News
            </ViewAll>
          </div>
        </div>
      </section>

{/* Leadership */}
      <section className="wrap pb-16 text-center md:pb-20">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">
          Our leadership
        </h2>

        <div className="mt-8">
          <Leadership />
        </div>

        <Link
          href="/about"
          className="mt-8 inline-block text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
        >
          About MOA
        </Link>
      </section>
      
      {/* Closing call to action */}
      <section className="wrap pb-16 md:pb-24">
        <div className="on-dark flex flex-col items-start justify-between gap-10 rounded-3xl bg-brand-dark p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight md:text-4xl">
              Optometrist, student or practitioner in Manipur? Join MOA.
            </h2>

            <div className="mt-6">
              <Cta href="/membership" variant="mint">
                Become a member
              </Cta>
            </div>
          </div>

          

          {/* MOA logo */}
          <div className="flex shrink-0 items-center justify-center md:pr-6">
            <img
              src="/logo1.png"
              alt="Manipur Optometrist Association"
              className="h-60 w-60 object-contain md:h-60 md:w-60"
            />
          </div>

          {/* Gallery banner (fades from one photo to the next) */}
      <div className="pt-4">
        <GalleryBanner photos={bannerPhotos} />
      </div>
        </div>
      </section>
    </>
  );
}