import { notFound } from 'next/navigation';
import Link from 'next/link';
import { projects } from '@/lib/data';
import { PageHero } from '@/components/Page';
import { Card, SectionTitle, Button } from '@/components/ui';

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function Project({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = projects.find((x) => x.id === id);
  if (!p) notFound();

  return (
    <>
      <PageHero title={p.title} subtitle={`${p.category} · ${p.location} · ${p.status}`} />
      <div className="wrap py-16">
        <Link href="/projects" className="text-sm font-semibold text-brand hover:underline">
          ← All projects
        </Link>

        <div className="mt-6">
          <SectionTitle eyebrow="Overview" title="Why this project matters" text={p.description} />
        </div>

        <SectionTitle eyebrow="Objectives" title="What we aim to achieve" />
        <div className="grid gap-4 md:grid-cols-3">
          {['Improve awareness', 'Support early identification', 'Connect communities with eye-care services'].map((x) => (
            <Card key={x}>
              <h3 className="font-bold text-brand-dark">{x}</h3>
              <p className="mt-2 text-sm text-muted">Details coming soon.</p>
            </Card>
          ))}
        </div>

        <div className="mt-14">
          <SectionTitle eyebrow="Activities" title="Project timeline" />
          <div className="space-y-4">
            {['Planning', 'Community engagement', 'Implementation', 'Impact review'].map((x, i) => (
              <div key={x} className="flex gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-dark font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark">{x}</h3>
                  <p className="text-sm text-muted">Details coming soon.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <Button href="/contact">Get Involved</Button>
        </div>
      </div>
    </>
  );
}