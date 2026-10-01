import Link from 'next/link';
import { news } from '@/lib/data';

export default function Ticker() {
  const items = news.slice(0, 5);
  if (items.length === 0) return null;

  const row = (suffix: string) =>
    items.map((n) => (
      <span key={n.slug + suffix} className="mx-6 shrink-0">
        <Link
          href={'/news/' + n.slug}
          className="font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
        >
          {n.title}
        </Link>
        <span className="ml-6 text-red-700">|</span>
      </span>
    ));

  return (
    <div className="overflow-hidden bg-amber-100 py-2 text-sm">
      <div className="marquee flex w-max whitespace-nowrap">
        {row('a')}
        {/* duplicated for a seamless loop */}
        {row('b')}
      </div>
    </div>
  );
}