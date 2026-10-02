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
import { getUpcomingEvents, getLatestNews } from '@/lib/content';
import { getBannerContent } from '@/lib/banner';
import { getHeroContent } from '@/lib/hero';

// Always read fresh events/news so admin changes show up immediately
export const dynamic = 'force-dynamic';

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
  // DB dates are 'YYYY-MM-DD'; parse as local time so the day never shifts
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T00:00:00' : value);

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
  // Events and news now come from the admin-managed database
  const [upcoming, latest, bannerContent, heroContent] = await Promise.all([
    getUpcomingEvents(3),
    getLatestNews(3),
    // Admin-chosen banner slides (falls back to the latest 6 gallery photos)
    getBannerContent(),
    // Hero photo + text chosen in Admin > Hero image
    getHeroContent(),
  ]);
  const { photos: bannerPhotos, settings: banner } = bannerContent;
  const { image: heroImage, settings: hero } = heroContent;

  // Hero photo: admin-chosen image, else the first banner photo, else /public/hero.jpg
  const heroSrc = heroImage?.url ?? bannerPhotos[0]?.src ?? '/hero.jpg';

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
            {hero.title}
          </h1>

          {hero.tagline && (
            <p className="mt-5 max-w-2xl font-display text-xl font-bold leading-snug text-ink md:text-3xl">
              {hero.tagline}
            </p>
          )}

          {((hero.cta1Label && hero.cta1Href) || (hero.cta2Label && hero.cta2Href)) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {hero.cta1Label && hero.cta1Href && <Cta href={hero.cta1Href}>{hero.cta1Label}</Cta>}

              {hero.cta2Label && hero.cta2Href && (
                <Cta href={hero.cta2Href} variant="ghost">
                  {hero.cta2Label}
                </Cta>
              )}
            </div>
          )}
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
                          {e.type && <span>{e.type}</span>}
                          {e.location && <span>{e.location}</span>}
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
                    {n.category && (
                      <div className="text-sm font-medium text-brand">
                        {n.category}
                      </div>
                    )}

                    <div className="mt-1 font-semibold group-hover:text-brand">
                      {n.title}
                    </div>

                    {n.summary && (
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                        {n.summary}
                      </p>
                    )}
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

      {/* Gallery banner (fades from one photo to the next), full width */}
      <section className="w-full pb-6 md:pb-16">
        <GalleryBanner photos={bannerPhotos} {...banner} />
      </section>
    </>
  );
}