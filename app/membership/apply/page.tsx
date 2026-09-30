// Path: app/membership/apply/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/Page';
import { Card, SectionTitle } from '@/components/ui';
import MembershipForm from '../MembershipForm';
import { getCurrentApplicationId, loadDraft } from '../apply-data';

export const dynamic = 'force-dynamic'; // depends on the visitor's cookie / login
export const metadata: Metadata = {
  title: 'Apply for Membership | MOA',
  description: 'Complete the online MOA membership application form.',
};

export default async function ApplyPage() {
  const id = await getCurrentApplicationId();
  const draft = id ? await loadDraft(id) : null;

  return (
    <>
      <PageHero
        title="Membership Application"
        subtitle={
          draft
            ? 'Welcome back — pick up where you left off.'
            : 'Complete the steps below to register as a member.'
        }
      />

      <div className="container py-16">
        <p className="mb-6 text-sm">
          <Link href="/membership#process" className="font-semibold text-[#0d9488] hover:underline">
            ← Back to registration process
          </Link>
        </p>

        <SectionTitle
          eyebrow="Application"
          title="Online membership application"
          text="Keep your documents (as one PDF) ready. Fields marked * are required. Your progress is saved after each step, so you can finish later."
        />

        {!draft && (
          <p className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Already started an application?{' '}
            <Link href="/membership/apply/resume" className="font-semibold text-[#0d9488] hover:underline">
              Continue with your email and date of birth →
            </Link>
          </p>
        )}

        <Card>
          <MembershipForm initial={draft} />
        </Card>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already submitted?{' '}
          <Link href="/membership/track" className="font-semibold text-[#0d9488] hover:underline">
            Track your application
          </Link>
          {' · '}
          <Link href="/membership/login" className="font-semibold text-[#0d9488] hover:underline">
            Member login
          </Link>
        </p>
      </div>
    </>
  );
}
