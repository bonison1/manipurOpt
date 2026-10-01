// Path: app/membership/apply/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { PageBody, Panel, linkCls } from '@/components/form-ui';
import MembershipForm from '../MembershipForm';
import { getCurrentApplicationId, loadDraft } from '../apply-data';

export const dynamic = 'force-dynamic'; // depends on the visitor's cookie / login
export const metadata: Metadata = {
  title: 'Apply for Membership | MOA',
  description: 'Complete the online MOA membership application form.',
};

// /membership/apply          -> always a blank form (refresh / Exit / Logout start from step 1)
// /membership/apply?resume=1 -> continue the saved application (dashboard button, email + date of birth)
export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ resume?: string }> }) {
  const { resume } = await searchParams;
  const wantsResume = resume === '1';

  let draft = null;
  if (wantsResume) {
    const id = await getCurrentApplicationId();
    if (!id) redirect('/membership/login'); // not logged in: log in to continue
    draft = await loadDraft(id);
    if (!draft) redirect('/membership/dashboard'); // already submitted
  }

  return (
    <>
      <PageHero
        align="center"
        title="Membership application"
        subtitle={
          draft
            ? 'Welcome back — pick up where you left off.'
            : 'Complete the steps below to register as a member.'
        }
      />

      <PageBody width="max-w-4xl">
        <p className="mb-6 text-sm">
          <Link href="/membership#process" className={linkCls}>
            ← Back to registration process
          </Link>
        </p>

        <p className="mb-6 leading-7 text-muted">
          Keep your documents (as one PDF) ready. Fields marked * are required. Your progress is saved after
          each step, so you can finish later.
        </p>

        {!draft && (
          <p className="mb-6 rounded-2xl bg-tint px-5 py-4 text-sm">
            Already started an application?{' '}
            <Link href="/membership/apply/resume" className={linkCls}>
              Continue with your email and date of birth →
            </Link>
          </p>
        )}

        <Panel>
          <MembershipForm initial={draft} />
        </Panel>

        <p className="mt-6 text-center text-sm text-muted">
          Already submitted?{' '}
          <Link href="/membership/track" className={linkCls}>
            Track your application
          </Link>
          {' · '}
          <Link href="/membership/login" className={linkCls}>
            Member login
          </Link>
        </p>
      </PageBody>
    </>
  );
}