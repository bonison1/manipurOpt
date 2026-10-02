// app/register/[type]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { PageBody, Panel, linkCls } from '@/components/form-ui';
import RegistrationForm from '../RegistrationForm';
import { REGISTRATIONS, REG_TYPES, isRegType } from '../config';

export function generateStaticParams() {
  return REG_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  if (!isRegType(type)) return {};
  return { title: `${REGISTRATIONS[type].title} | MOA` };
}

export default async function RegisterTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isRegType(type)) notFound();
  const config = REGISTRATIONS[type];

  return (
    <>
      <PageHero align="center" title={config.title} subtitle="Fields marked * are required." />
      <PageBody width="max-w-2xl">
        <p className="mb-6 text-sm">
          <Link href="/register" className={linkCls}>
            ← All registrations
          </Link>
        </p>
        <Panel>
          <RegistrationForm config={config} />
        </Panel>
      </PageBody>
    </>
  );
}