import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui';
import RefreshOnShow from '@/components/RefreshOnShow';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { resolveRole, HOME } from '@/lib/auth/resolve-home';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin Login | MOA' };

// Only allow redirects to pages inside /admin (prevents open redirects).
function safeNext(value?: string) {
  if (!value) return '/admin';
  const inAdmin = value === '/admin' || value.startsWith('/admin/');
  return inAdmin && !value.startsWith('/admin/login') ? value : '/admin';
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Already logged in? Admins go to /admin, members go to their dashboard.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = await resolveRole(supabase, user.email);
    if (role === 'admin') redirect(safeNext(next));
    if (role === 'member') redirect(HOME.member);
  }

  return (
    <div className="container py-16">
      {/* Back button on a cached copy: re-check on the server */}
      <RefreshOnShow />
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-black text-[#073b66]">Admin login</h1>
        <p className="mb-6 text-sm text-slate-500">Authorised MOA administrators only.</p>
        <Card>
          <LoginForm next={next} />
        </Card>
      </div>
    </div>
  );
}