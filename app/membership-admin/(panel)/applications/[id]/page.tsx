import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, inr } from '@/lib/format';
import { markPaidOffline, updateApplicationStatus } from '@/app/membership-admin/actions';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

const errorText: Record<string, string> = {
  unpaid:
    'Cannot approve: the fee has not been paid. If it was collected another way, use "Mark as paid (offline)" first.',
  save: 'Could not save the change. Please try again.',
};

export default async function ApplicationDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const db = createServiceClient();
  const { data: a } = await db.from('membership_applications').select('*').eq('id', id).maybeSingle();
  if (!a) notFound();

  const details: [string, string | null][] = [
    ['Full name', a.full_name],
    ['Date of birth', a.date_of_birth],
    ['Phone', a.phone],
    ['Email', a.email],
    ['District', a.district],
    ['Address', a.address],
    ['Qualification', a.qualification],
    ['Institution', a.institution],
    ['Professional registration no.', a.professional_reg_no],
    ['Category', a.membership_category],
    ['Submitted', formatDate(a.created_at)],
  ];

  return (
    <div className="grid gap-8">
      <div>
        <Link href="/membership-admin" className="text-sm font-semibold text-[#0d9488] hover:underline">
          ← All applications
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-mono text-2xl font-black text-[#073b66]">{a.application_no}</h1>
          <div className="flex gap-2">
            <StatusBadge value={a.payment_status} />
            <StatusBadge value={a.status} />
          </div>
        </div>
      </div>

      {saved && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Saved.</p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorText[error] ?? 'Something went wrong.'}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#073b66]">Applicant</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-slate-800">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#073b66]">Payment</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Fee</dt>
            <dd className="mt-1">{inr(a.fee_amount)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Method</dt>
            <dd className="mt-1">{a.payment_method ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Paid at</dt>
            <dd className="mt-1">{formatDate(a.paid_at)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Razorpay payment ID</dt>
            <dd className="mt-1 font-mono text-sm">{a.razorpay_payment_id ?? '—'}</dd>
          </div>
        </dl>

        {a.payment_status === 'unpaid' && (
          <form action={markPaidOffline} className="mt-5">
            <input type="hidden" name="id" value={a.id} />
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Mark as paid (offline)
            </button>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-bold text-[#073b66]">Review</h2>
        <p className="mb-4 text-sm text-slate-500">
          {a.reviewed_by
            ? `Last reviewed by ${a.reviewed_by} on ${formatDate(a.reviewed_at)}.`
            : 'Not reviewed yet.'}
        </p>

        <form action={updateApplicationStatus} className="grid gap-4">
          <input type="hidden" name="id" value={a.id} />
          <label className="grid gap-2 text-sm font-semibold">
            Note to applicant (shown on the tracking page)
            <textarea
              name="admin_notes"
              defaultValue={a.admin_notes ?? ''}
              rows={3}
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488]"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="status"
              value="approved"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              type="submit"
              name="status"
              value="rejected"
              className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
            >
              Reject
            </button>
            <button
              type="submit"
              name="status"
              value="pending"
              className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset to pending
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}