// Path: app/admin/application/page.tsx
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { APPLICATIONS_TABLE as T } from '@/lib/auth/config';
import { REGISTRATIONS, REG_TYPES, isRegType } from '@/app/register/config';
import AdminNav from '../AdminNav';
import type { AdminApp, AdminProof } from './ApplicationCard';
import ApplicationsTable, { type Row, type RowKind } from './ApplicationsTable';

export const dynamic = 'force-dynamic';

type Proof = AdminProof & {
  file_path: string;
  application_id?: string | null;
  registration_id?: string | null;
  application_no?: string | null;
  reference_no?: string | null;
};

type Item = {
  kind: RowKind;
  app: AdminApp;
  certificateNo: string | null;
  details: [string, string][];
};

const TABS = [
  { key: 'proofs', label: 'Payments to verify' },
  { key: 'review', label: 'Ready for approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'all', label: 'All' },
];

const TYPES: { key: string; label: string }[] = [
  { key: 'all', label: 'All types' },
  { key: 'membership', label: 'Membership' },
  ...REG_TYPES.map((t) => ({ key: t as string, label: REGISTRATIONS[t].title })),
];

type Rec = Record<string, unknown>;

/** [label, column] pairs -> only the ones that actually have a value. */
function pick(row: Rec, fields: [string, string][]): [string, string][] {
  const out: [string, string][] = [];
  for (const [label, key] of fields) {
    const v = row[key];
    if (v !== null && v !== undefined && String(v).trim() !== '') out.push([label, String(v)]);
  }
  return out;
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; type?: string }>;
}) {
  const user = await requireAdmin();
  const { filter = 'proofs', type = 'all' } = await searchParams;
  const sb = createAdminClient();

  const [appsRes, regsRes] = await Promise.all([
    sb.from(T).select('*').order('created_at', { ascending: false }).limit(300),
    sb.from('registrations').select('*').order('created_at', { ascending: false }).limit(300),
  ]);
  if (regsRes.error) console.error('admin: registrations load failed', regsRes.error);

  // ---- normalise both sources into one list ----
  const members: Item[] = ((appsRes.data ?? []) as Rec[]).map((a) => ({
    kind: 'membership',
    app: a as unknown as AdminApp,
    certificateNo: (a.certificate_no as string | null) ?? null,
    details: pick(a, [
      ['Phone', 'phone'],
      ['District', 'district'],
      ['Qualification', 'qualification'],
      ['Institution', 'institution'],
      ['Professional reg. no.', 'professional_reg_no'],
    ]),
  }));

  const registrations: Item[] = ((regsRes.data ?? []) as Rec[])
    .filter((r) => isRegType(String(r.type)))
    .map((r) => {
      const t = String(r.type) as keyof typeof REGISTRATIONS;
      const cfg = REGISTRATIONS[t];
      return {
        kind: t,
        app: {
          id: String(r.id ?? r.reference_no),
          application_no: String(r.reference_no),
          full_name: String(r.name ?? ''),
          membership_category: cfg.title,
          email: String(r.email ?? ''),
          fee_amount: Number(r.fee_amount ?? cfg.fee),
          payment_status: String(r.payment_status ?? 'unpaid'),
          status: String(r.status ?? 'pending'),
          created_at: String(r.created_at),
          admin_notes: (r.admin_notes as string | null) ?? null,
        },
        certificateNo: (r.certificate_no as string | null) ?? null,
        details: pick(r, [
          ['Phone', 'phone'],
          ['Address', 'address'],
          ['Affiliation no.', 'affiliation_no'],
          ['Registration no.', 'registration_no'],
          ['Institution', 'institution_name'],
          ['University', 'university_name'],
          ['Admission year', 'admission_year'],
        ]),
      };
    });

  const everything = [...members, ...registrations].sort((a, b) => b.app.created_at.localeCompare(a.app.created_at));
  const list = type === 'all' ? everything : everything.filter((i) => i.kind === type);

  // ---- payment proofs (membership proofs and registration proofs live in the same table) ----
  const { data: proofRows } = await sb
    .from('payment_proofs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  const byId = new Map<string, Proof>();
  const byRef = new Map<string, Proof>();
  for (const p of (proofRows ?? []) as Proof[]) {
    for (const k of [p.application_id, p.registration_id]) if (k && !byId.has(k)) byId.set(k, p);
    for (const k of [p.application_no, p.reference_no]) if (k && !byRef.has(k)) byRef.set(k, p);
  }
  const proofFor = (i: Item) => byId.get(i.app.id) ?? byRef.get(i.app.application_no) ?? null;

  const matches: Record<string, (i: Item) => boolean> = {
    proofs: (i) => proofFor(i)?.status === 'pending',
    review: (i) => i.app.payment_status === 'paid' && i.app.status === 'pending',
    approved: (i) => i.app.status === 'approved',
    all: () => true,
  };
  const counts = Object.fromEntries(TABS.map((t) => [t.key, list.filter(matches[t.key]).length]));
  const shown = list.filter(matches[filter] ?? matches.proofs);

  // short-lived links to the private screenshots
  const paths = shown.map((i) => proofFor(i)?.file_path).filter(Boolean) as string[];
  const urlByPath = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await sb.storage.from('payment-proofs').createSignedUrls(paths, 600);
    signed?.forEach((s) => s.path && s.signedUrl && urlByPath.set(s.path, s.signedUrl));
  }

  const rows: Row[] = shown.map((i) => {
    const p = proofFor(i);
    return {
      kind: i.kind,
      app: i.app,
      certificateNo: i.certificateNo,
      details: i.details,
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

  const href = (f: string, t: string) => `/admin/application?filter=${f}&type=${t}`;

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Applications &amp; registrations</h1>

      {/* Which form */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Link
            key={t.key}
            href={href(filter, t.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              type === t.key ? 'bg-[#0d9488] text-white' : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Which stage */}
      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={href(t.key, type)}
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
        <ApplicationsTable key={`${filter}:${type}`} rows={rows} />
      </div>
    </div>
  );
}