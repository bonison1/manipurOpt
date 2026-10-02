import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/require-admin';
import { createServiceClient } from '@/lib/supabase/server';
import { inr } from '@/lib/format';
import ProofActions from './ProofActions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Registrations | MOA Admin' };

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'membership', label: 'Membership' },
  { key: 'student', label: 'Students' },
  { key: 'institute', label: 'Institutes' },
  { key: 'clinic', label: 'Clinics' },
] as const;

const TYPE_LABEL: Record<string, string> = {
  membership: 'Membership',
  student: 'Student',
  institute: 'Institute',
  clinic: 'Clinic',
};

type Proof = { id: string; file_path: string };

type Row = {
  key: string;
  kind: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  detail: string;
  fee: number;
  payment: string;
  status: string;
  created: string;
  proof?: Proof;
};

function badge(value: string) {
  const tone =
    value === 'paid' || value === 'approved'
      ? 'bg-emerald-50 text-emerald-800'
      : value === 'rejected'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-800';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{value.replace('_', ' ')}</span>;
}

export default async function AdminRegistrations({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await isAdmin())) notFound();

  const { tab = 'all' } = await searchParams;
  const active = TABS.some((t) => t.key === tab) ? tab : 'all';

  const db = createServiceClient();
  const [membership, registrations, pendingProofs] = await Promise.all([
    db.from('membership_applications').select('*').eq('is_draft', false),
    db.from('registrations').select('*'),
    db.from('payment_proofs').select('id, file_path, application_id, registration_id').eq('status', 'pending'),
  ]);

  const proofFor = new Map<string, Proof>();
  for (const p of pendingProofs.data ?? []) {
    const owner = p.registration_id ?? p.application_id;
    if (owner) proofFor.set(owner, { id: p.id, file_path: p.file_path });
  }

  const rows: Row[] = [];

  for (const m of membership.data ?? []) {
    rows.push({
      key: `m-${m.id}`,
      kind: 'membership',
      ref: m.application_no ?? '—',
      name: m.full_name ?? '—',
      email: m.email ?? '—',
      phone: m.phone ?? '—',
      detail: m.membership_category ?? '—',
      fee: Number(m.fee_amount ?? 0),
      payment: m.payment_status ?? 'unpaid',
      status: m.status ?? 'pending',
      created: m.created_at ?? m.submitted_at ?? '',
      proof: proofFor.get(m.id),
    });
  }

  for (const r of registrations.data ?? []) {
    const detail =
      r.type === 'institute'
        ? [r.university_name, r.affiliation_no && `Aff. ${r.affiliation_no}`].filter(Boolean).join(' · ')
        : r.type === 'student'
          ? [r.institution_name, r.admission_year && `Batch ${r.admission_year}`].filter(Boolean).join(' · ')
          : r.registration_no
            ? `Reg. ${r.registration_no}`
            : '';
    rows.push({
      key: `r-${r.id}`,
      kind: r.type,
      ref: r.reference_no,
      name: r.name,
      email: r.email,
      phone: r.phone,
      detail: detail || '—',
      fee: Number(r.fee_amount ?? 0),
      payment: r.payment_status ?? 'unpaid',
      status: r.status ?? 'pending',
      created: r.created_at ?? '',
      proof: proofFor.get(r.id),
    });
  }

  rows.sort((a, b) => (b.created || '').localeCompare(a.created || ''));

  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.kind] = (counts[r.kind] ?? 0) + 1;

  const visible = active === 'all' ? rows : rows.filter((r) => r.kind === active);

  return (
    <main className="wrap py-10">
      <h1 className="font-display text-2xl font-bold md:text-3xl">All registrations</h1>
      <p className="mt-1 text-sm text-muted">Membership applications, students, institutes and clinics in one place.</p>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Registration type">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === 'all' ? '/admin/registrations' : `/admin/registrations?tab=${t.key}`}
            aria-current={active === t.key ? 'page' : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              active === t.key ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:bg-tint'
            }`}
          >
            {t.label} <span className="opacity-70">({counts[t.key] ?? 0})</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-line bg-tint text-xs uppercase tracking-wide text-muted">
            <tr>
              {['Reference', 'Type', 'Name', 'Contact', 'Details', 'Fee', 'Payment', 'Status', 'Submitted', 'Proof'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-muted">
                  Nothing here yet.
                </td>
              </tr>
            )}
            {visible.map((r) => (
              <tr key={r.key} className="align-top">
                <td className="px-4 py-3 font-mono text-xs">{r.ref}</td>
                <td className="px-4 py-3">{TYPE_LABEL[r.kind] ?? r.kind}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">
                  <div>{r.email}</div>
                  <div className="text-muted">{r.phone}</div>
                </td>
                <td className="px-4 py-3 text-muted">{r.detail}</td>
                <td className="px-4 py-3">{inr(r.fee)}</td>
                <td className="px-4 py-3">{badge(r.payment)}</td>
                <td className="px-4 py-3">{badge(r.status)}</td>
                <td className="px-4 py-3 text-muted">
                  {r.created ? new Date(r.created).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3">
                  {r.proof ? <ProofActions proofId={r.proof.id} filePath={r.proof.file_path} /> : <span className="text-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}