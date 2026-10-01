// Path: app/membership/apply/resume/page.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { PageBody, Panel } from '@/components/form-ui';
import { getCurrentApplicationId, loadDraft } from '../../apply-data';
import ResumeForm from './ResumeForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Continue Application | MOA' };

export default async function ResumePage() {
  // Already recognised (cookie or logged-in member)? Go straight to the form.
  const id = await getCurrentApplicationId();
  if (id && (await loadDraft(id))) redirect('/membership/apply?resume=1');

  return (
    <>
      <PageHero
        align="center"
        title="Continue your application"
        subtitle="Enter the email and date of birth you used in step 1 to carry on where you stopped."
      />
      <PageBody width="max-w-md">
        <Panel>
          <ResumeForm />
        </Panel>
      </PageBody>
    </>
  );
}