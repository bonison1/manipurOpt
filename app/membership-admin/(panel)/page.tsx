import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/service';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, inr } from '@/lib/format';

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default async function AdminApplications({ searchParams }: Props) {
  const { status = 'all', q = '' } = await searchParams;
  const db = createServiceClient();

  // Summary counts
  const { data: all } = await db.from('membership_applications').select('status, payment_status');
  const list = all ?? [];
  const stats = [
    { label: 'Total', value: list.length },
    { label: 'Ready for review', value: list.filter((r) => r.status === 'pending' && r.payment_status === 'paid').length },
    { label: 'Awaiting payment', value: list.filter((r) => r.status === 'pending' && r.payment_status === 'unpaid').length },
    { label: 'Approved', value: list.filter((r) => r.status === 'approved').length },
    { label: 'Rejected', value: list.filter((r) => r.status === 'rejected').length },
  ];

  // Filtered rows
  let query = db
    .from('membership_applications')
    .select('id, application_no, full_name, email, membership_category, status, payment_status, fee_amount, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (['pending', 'approved', 'rejected'].includes(status)) query = query.eq('status', status);
  if (status === 'unpaid') query = query.eq('payment_status', 'unpaid');

  const term = q.replace(/[%,()*]/g, '').trim();
  if (term) {
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,application_no.ilike.%${term}%`
    );
  }

  const { data: rows, error } = await query;

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-black text-[#073b66]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/membership-admin?status=${t.key}${term ? `&q=${encodeURIComponent(term)}` : ''}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                status === t.key
                  ? 'bg-[#0d9488] text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <form className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            name="q"
            defaultValue={term}
            placeholder="Search name, email or number"
            className="w-64 rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#0d9488]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#073b66] px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load applications: {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-semibold">
                  <Link
                    href={`/membership-admin/applications/${r.id}`}
                    className="text-[#0d9488] hover:underline"
                  >
                    {r.application_no}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">{r.full_name}</p>
                  <p className="text-xs text-slate-500">{r.email}</p>
                </td>
                <td className="px-4 py-3">{r.membership_category}</td>
                <td className="px-4 py-3">{inr(r.fee_amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={r.payment_status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={r.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
              </tr>
            ))}
            {(rows ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}