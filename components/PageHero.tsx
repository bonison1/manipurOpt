// Path: components/PageHero.tsx
import Link from 'next/link';

export function PageHero({
  title,
  subtitle,
  children,
  align = 'left',
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  const center = align === 'center';

  return (
    <section className="border-b border-line bg-white">
      <div className="wrap py-14 md:py-20">
        <h1
          className={`max-w-3xl font-display text-4xl font-extrabold tracking-tight md:text-5xl ${
            center ? 'mx-auto text-center' : ''
          }`}
        >
          {title}
        </h1>
        <p className={`mt-4 max-w-xl text-lg leading-8 text-muted ${center ? 'mx-auto text-center' : ''}`}>
          {subtitle}
        </p>
        {children && (
          <div className={`mt-8 flex flex-wrap items-center gap-3 ${center ? 'justify-center' : ''}`}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function GridCards({
  items,
}: {
  items: { title: string; description: string; label?: string; href?: string }[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((x, i) => (
        <div key={i} className="rounded-3xl border border-line bg-white p-6">
          {x.label && <div className="text-sm font-medium text-brand">{x.label}</div>}
          <h3 className="mt-1 font-display text-xl font-bold">{x.title}</h3>
          <p className="mt-2 leading-7 text-muted">{x.description}</p>
          {x.href && (
            <Link href={x.href} className="mt-4 inline-block text-sm font-semibold text-brand hover:text-brand-dark hover:underline">
              View details
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}