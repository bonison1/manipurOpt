import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { PageBody, Panel } from '@/components/form-ui';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { resolveRole, HOME } from '@/lib/auth/resolve-home';
import RefreshOnShow from '../RefreshOnShow';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Member Login | MOA' };

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already logged in? Send them to the right place for their role.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = await resolveRole(supabase, user.email);
    if (role) redirect(HOME[role]);
  }

  const { error } = await searchParams;
  const notice =
    error === 'confirm'
      ? 'We could not complete the confirmation automatically. If you already clicked the link in your email, just log in below.'
      : undefined;

  return (
    <>
      <RefreshOnShow />
      <PageHero
        align="center"
        title="Member login"
        subtitle="Log in to see your membership status, member card and certificate number."
      />
      <PageBody width="max-w-md">
        <Panel>
          <LoginForm notice={notice} />
        </Panel>
      </PageBody>
    </>
  );
}