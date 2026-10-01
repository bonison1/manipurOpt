// Path: app/membership/track/page.tsx
import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { PageBody, Panel } from '@/components/form-ui';
import TrackForm from './TrackForm';
import { getTrackIdentity } from './track-data';

export const dynamic = 'force-dynamic'; // result depends on who is logged in
export const metadata: Metadata = {
  title: 'Track Application | MOA',
};

export default async function TrackPage() {
  const { signedInEmail, application } = await getTrackIdentity();

  return (
    <>
      <PageHero
        align="center"
        title="Track your application"
        subtitle={
          signedInEmail
            ? `Signed in as ${signedInEmail}.`
            : 'Log in to see your status automatically, or enter your registration number and email.'
        }
      />
      <PageBody width="max-w-2xl">
        <Panel>
          <TrackForm member={application} signedIn={!!signedInEmail} />
        </Panel>
      </PageBody>
    </>
  );
}