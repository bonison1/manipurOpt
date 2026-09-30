// Path: app/admin/application/page.tsx
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { APPLICATIONS_TABLE as T } from '@/lib/auth/config';
import AdminNav from '../AdminNav';
import type { AdminApp, AdminProof } from './ApplicationCard';
import ApplicationsTable from './ApplicationsTable';

export const dynamic = 'force-dynamic';

type Proof = AdminProof & { application_id: string; file_path: string };

const TABS = [
  { key: 'proofs', label: 'Payments to verify' },
  { key: 'review', label: 'Ready for approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'all', label: 'All' },
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireAdmin();
  const { filter = 'proofs' } = await searchParams;
  const sb = createAdminClient();

  const { data: apps } = await sb.from(T).select('*').order('created_at', { ascending: false }).limit(300);
  const list = (apps ?? []) as AdminApp[];

  const { data: proofRows } = list.length
    ? await sb
        .from('payment_proofs')
        .select('*')
        .in('application_id', list.map((a) => a.id))
        .order('created_at', { ascending: false })
    : { data: [] as Proof[] };

  // latest proof per application
  const latest = new Map<string, Proof>();
  for (const p of (proofRows ?? []) as Proof[]) if (!latest.has(p.application_id)) latest.set(p.application_id, p);

  const matches: Record<string, (a: AdminApp) => boolean> = {
    proofs: (a) => latest.get(a.id)?.status === 'pending',
    review: (a) => a.payment_status === 'paid' && a.status === 'pending',
    approved: (a) => a.status === 'approved',
    all: () => true,
  };
  const counts = Object.fromEntries(TABS.map((t) => [t.key, list.filter(matches[t.key]).length]));
  const shown = list.filter(matches[filter] ?? matches.proofs);

  // short-lived links to the private screenshots
  const paths = shown.map((a) => latest.get(a.id)?.file_path).filter(Boolean) as string[];
  const urlByPath = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await sb.storage.from('payment-proofs').createSignedUrls(paths, 600);
    signed?.forEach((s) => s.path && s.signedUrl && urlByPath.set(s.path, s.signedUrl));
  }

  const rows = shown.map((a) => {
    const p = latest.get(a.id) ?? null;
    return {
      app: a,
      proof: p
        ? {
            id: p.id,
            transaction_ref: p.transaction_ref,
            status: p.status,
            reviewer_note: p.reviewer_note,
            created_at: p.created_at,
          }
        : null,
      proofUrl: p ? (urlByPath.get(p.file_path) ?? null) : null,
    };
  });

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Membership applications</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/application?filter=${t.key}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === t.key ? 'bg-[#073b66] text-white' : 'border border-slate-200 bg-white text-slate-700'
            }`}
          >
            {t.label} ({counts[t.key]})
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {/* key resets search box + row state when switching tabs */}
        <ApplicationsTable key={filter} rows={rows} />
      </div>
    </div>
  );
}