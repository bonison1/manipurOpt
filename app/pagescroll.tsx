// Path: app/page.tsx
import Link from 'next/link';
import { AcademicCapIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import Cta from '@/components/Cta';
import HeroEye from '@/components/HeroEye';
import { events, news } from '@/lib/data';

const pillars = [
  { Icon: AcademicCapIcon, title: 'Professional development', text: 'CME, workshops and regional summits for practising optometrists.' },
  { Icon: EyeIcon, title: 'Primary eye care', text: 'Ethical, accessible and standardised eye care across the state.' },
  { Icon: HeartIcon, title: 'Community welfare', text: 'Screenings and awareness programs for schools and communities.' },
];

function dateParts(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return { day: d.getDate(), month: d.toLocaleString('en-GB', { month: 'short' }) };
}

function PanelHead({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <Link href={href} className="text-sm font-semibold text-brand hover:text-brand-dark hover:underline">
        {label}
      </Link>
    </div>
  );
}

export default function Home() {
  const upcoming = events.slice(0, 3);
  const latest = news.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="wrap grid items-center gap-12 py-14 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="font-display text-[2.4rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            <span className="block">Advancing optometry.</span>
            <span className="block">Improving vision.</span>
            <span className="block text-brand">Serving Manipur.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-muted">
            The professional association for optometrists, students and eye-care practitioners in Manipur.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Cta href="/membership">Become a member</Cta>
            <Cta href="/events" variant="ghost">See events</Cta>
          </div>
        </div>

        <HeroEye />
      </section>

      {/* What we do */}
      <section className="wrap pb-16 md:pb-20">
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
        <div className="rounded-3xl border border-line bg-white p-7">
          <PanelHead title="Events" href="/events" label="All events" />
          {upcoming.length === 0 ? (
            <p className="mt-6 text-muted">No upcoming events yet. Check back soon.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {upcoming.map((e) => {
                const p = dateParts(e.date);
                return (
                  <li key={e.id}>
                    <Link href={'/event/' + e.id} className="group flex gap-4 py-4">
                      {p && (
                        <div className="w-14 shrink-0 rounded-xl bg-tint py-2 text-center text-brand-dark">
                          <div className="font-display text-2xl font-bold leading-none">{p.day}</div>
                          <div className="mt-1 text-xs font-semibold">{p.month}</div>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold group-hover:text-brand">{e.title}</div>
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
        </div>

        <div className="rounded-3xl border border-line bg-white p-7">
          <PanelHead title="News" href="/news" label="All news" />
          {latest.length === 0 ? (
            <p className="mt-6 text-muted">No announcements yet. Check back soon.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {latest.map((n) => (
                <li key={n.slug}>
                  <Link href={'/news/' + n.slug} className="group block py-4">
                    <div className="text-sm font-medium text-brand">{n.category}</div>
                    <div className="mt-1 font-semibold group-hover:text-brand">{n.title}</div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{n.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="wrap pb-16 md:pb-24">
        <div className="on-dark flex flex-col items-start justify-between gap-8 rounded-3xl bg-brand-dark p-8 text-white md:flex-row md:items-center md:p-12">
          <h2 className="max-w-xl font-display text-3xl font-bold leading-tight md:text-4xl">
            Optometrist, student or practitioner in Manipur? Join MOA.
          </h2>
          <Cta href="/membership" variant="mint">Become a member</Cta>
        </div>
      </section>
    </>
  );
}