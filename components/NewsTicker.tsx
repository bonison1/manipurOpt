// Path: components/Ticker.tsx
import Link from 'next/link';
import { getAllEvents, getLatestNews } from '@/lib/content';

type Item = { key: string; text: string; href: string };

export default async function Ticker() {
  const [events, news] = await Promise.all([
    getAllEvents().catch(() => []),
    getLatestNews().catch(() => []),
  ]);

  const latestEvents = [...events]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5);

  const items: Item[] = [
    { key: 'join', text: 'Become a member', href: '/membership' },
    ...latestEvents.map((e) => ({
      key: `e-${e.id}`,
      text: e.title,
      href: `/event/${e.id}`, // change to /events/${e.id} if that is your route
    })),
    ...news.slice(0, 5).map((n) => ({
      key: `n-${n.id}`,
      text: n.title,
      href: `/news/${n.slug}`,
    })),
  ];

  const group = (hidden: boolean) => (
    <ul
      className="flex min-w-[100vw] shrink-0 items-center justify-around gap-10 pr-10"
      aria-hidden={hidden || undefined}
    >
      {items.map((i, idx) => (
        <li key={i.key} className="flex items-center gap-10 whitespace-nowrap">
          <Link
            href={i.href}
            tabIndex={hidden ? -1 : undefined}
            className="font-medium text-red-700 underline hover:text-red-900"
          >
            {i.text}
          </Link>
          {idx < items.length - 1 || true ? (
            <span aria-hidden="true" className="text-red-700">|</span>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="overflow-hidden bg-amber-100 py-4 text-lg"
      role="region"
      aria-label="Latest updates"
    >
      <div className="marquee flex w-max">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}