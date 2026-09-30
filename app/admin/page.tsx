// Path: app/admin/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { APPLICATIONS_TABLE as T } from '@/lib/auth/config';
import AdminNav from './AdminNav';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const user = await requireAdmin();
  const sb = createAdminClient();

  const [proofs, review, approved, total] = await Promise.all([
    sb.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from(T).select('id', { count: 'exact', head: true }).eq('payment_status', 'paid').eq('status', 'pending'),
    sb.from(T).select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    sb.from(T).select('id', { count: 'exact', head: true }),
  ]);

  const stats = [
    { n: proofs.count ?? 0, label: 'Payments to verify', href: '/admin/application?filter=proofs' },
    { n: review.count ?? 0, label: 'Ready for approval', href: '/admin/application?filter=review' },
    { n: approved.count ?? 0, label: 'Approved members', href: '/admin/application?filter=approved' },
    { n: total.count ?? 0, label: 'Total applications', href: '/admin/application?filter=all' },
  ];

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">MOA Admin Dashboard</h1>
      <p className="mt-2 text-slate-500">Verify payments and review membership applications.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card>
              <div className="text-3xl font-black text-[#073b66]">{s.n}</div>
              <div className="mt-2 text-sm text-slate-500">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {['Members', 'Events', 'News', 'Projects', 'Resources', 'Gallery', 'Messages', 'Leadership'].map((x) => (
          <Card key={x}>
            <h2 className="font-bold text-[#073b66]">{x}</h2>
            <p className="mt-2 text-xs text-slate-500">Manage {x.toLowerCase()} — placeholder.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}