// Path: app/admin/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { APPLICATIONS_TABLE as T } from '@/lib/auth/config';
import AdminNav from './AdminNav';

export const dynamic = 'force-dynamic';

const sections: { label: string; href?: string; note: string }[] = [
  { label: 'Admins', href: '/admin/admins', note: 'Add or remove people who can access this panel.' },
  { label: 'Leadership', href: '/admin/leadership', note: 'Add leaders with name, position and photo.' },
  { label: 'Gallery', href: '/admin/gallery', note: 'Upload and remove gallery photos.' },
  { label: 'Members', note: 'placeholder' },
  { label: 'Events', note: 'placeholder' },
  { label: 'News', note: 'placeholder' },
  { label: 'Projects', note: 'placeholder' },
  { label: 'Resources', note: 'placeholder' },
  { label: 'Messages', note: 'placeholder' },
];

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
        {sections.map((x) => {
          const card = (
            <Card>
              <h2 className="font-bold text-[#073b66]">{x.label}</h2>
              <p className="mt-2 text-xs text-slate-500">
                {x.note === 'placeholder' ? `Manage ${x.label.toLowerCase()} — placeholder.` : x.note}
              </p>
            </Card>
          );
          return x.href ? (
            <Link key={x.label} href={x.href}>{card}</Link>
          ) : (
            <div key={x.label}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}