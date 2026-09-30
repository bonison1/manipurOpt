// Path: app/admin/applications/ApplicationCard.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveProof, rejectProof } from '@/app/membership/payment-actions';
import { approveApplication, rejectApplication } from './actions';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, inr } from '@/lib/format';

export type AdminApp = {
  id: string;
  application_no: string;
  full_name: string;
  membership_category: string;
  email: string;
  fee_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
};

export type AdminProof = {
  id: string;
  transaction_ref: string | null;
  status: string;
  reviewer_note: string | null;
  created_at: string;
};

type R = { ok: boolean; error?: string };

const btn = 'rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60';

export default function ApplicationCard({
  app,
  proof,
  proofUrl,
}: {
  app: AdminApp;
  proof: AdminProof | null;
  proofUrl: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  function run(fn: () => Promise<R>) {
    setError('');
    start(async () => {
      try {
        const r = await fn();
        if (r.ok) router.refresh();
        else setError(r.error ?? 'Something went wrong.');
      } catch {
        setError('Something went wrong.');
      }
    });
  }

  const proofPending = proof?.status === 'pending';
  const readyForApproval = app.payment_status === 'paid' && app.status === 'pending';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-bold text-[#073b66]">{app.application_no}</p>
          <p className="text-sm text-slate-700">
            {app.full_name} · {app.membership_category}
          </p>
          <p className="text-xs text-slate-500">
            {app.email} · applied {formatDate(app.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{inr(app.fee_amount)}</span>
          <StatusBadge value={app.payment_status} />
          <StatusBadge value={app.status} />
        </div>
      </div>

      {proof && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-slate-800">
              Payment proof · <span className="capitalize">{proof.status}</span>
            </p>
            {proofUrl && (
              <a href={proofUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#0d9488] underline">
                View screenshot ↗
              </a>
            )}
          </div>
          <p className="mt-1 text-slate-500">
            Submitted {formatDate(proof.created_at)}
            {proof.transaction_ref ? ` · UTR ${proof.transaction_ref}` : ''}
          </p>
          {proof.reviewer_note && <p className="mt-1 text-slate-500">Note: {proof.reviewer_note}</p>}
        </div>
      )}

      {app.admin_notes && <p className="mt-3 text-sm text-slate-500">Note to applicant: {app.admin_notes}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {proofPending && (
          <>
            <button
              disabled={pending}
              onClick={() => run(() => approveProof(proof!.id))}
              className={`${btn} bg-[#0d9488] text-white hover:bg-[#0b7d73]`}
            >
              Verify payment
            </button>
            <button
              disabled={pending}
              onClick={() => {
                const note = window.prompt('Why is this proof rejected? (shown to the applicant)') ?? null;
                if (note !== null) run(() => rejectProof(proof!.id, note));
              }}
              className={`${btn} border border-red-300 text-red-700 hover:bg-red-50`}
            >
              Reject proof
            </button>
          </>
        )}

        {readyForApproval && (
          <>
            <button
              disabled={pending}
              onClick={() => run(() => approveApplication(app.id))}
              className={`${btn} bg-[#073b66] text-white hover:bg-[#0d5b92]`}
            >
              Approve membership
            </button>
            <button
              disabled={pending}
              onClick={() => {
                const note = window.prompt('Reason for rejecting this application? (shown to the applicant)') ?? null;
                if (note !== null) run(() => rejectApplication(app.id, note));
              }}
              className={`${btn} border border-red-300 text-red-700 hover:bg-red-50`}
            >
              Reject application
            </button>
          </>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}