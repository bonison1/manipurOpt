// Path: app/membership/apply/resume/page.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/Page';
import { Card } from '@/components/ui';
import { getCurrentApplicationId, loadDraft } from '../../apply-data';
import ResumeForm from './ResumeForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Continue Application | MOA' };

export default async function ResumePage() {
  // Already recognised (cookie or logged-in member)? Go straight to the form.
  const id = await getCurrentApplicationId();
  if (id && (await loadDraft(id))) redirect('/membership/apply');

  return (
    <>
      <PageHero
        title="Continue your application"
        subtitle="Enter the email and date of birth you used in step 1 to carry on where you stopped."
      />
      <div className="container py-16">
        <div className="mx-auto max-w-md">
          <Card>
            <ResumeForm />
          </Card>
        </div>
      </div>
    </>
  );
}
