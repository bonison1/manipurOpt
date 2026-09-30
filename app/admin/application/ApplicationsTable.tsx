// Path: app/admin/application/ApplicationsTable.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveProof, rejectProof } from '@/app/membership/payment-actions';
import { approveApplication, rejectApplication } from './actions';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, inr } from '@/lib/format';
import type { AdminApp, AdminProof } from './ApplicationCard';

type WithCert = AdminApp & { certificate_no?: string | null };

export type Row = {
  app: AdminApp;
  proof: AdminProof | null;
  proofUrl: string | null;
};

type R = { ok: boolean; error?: string };

const btn = 'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60';
const th = 'px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500';
const td = 'px-4 py-3 align-top';

export default function ApplicationsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [q, setQ] = useState('');

  function run(appId: string, fn: () => Promise<R>) {
    setErrors((e) => {
      const next = { ...e };
      delete next[appId];
      return next;
    });
    setBusyId(appId);
    start(async () => {
      try {
        const r = await fn();
        if (r.ok) router.refresh();
        else setErrors((e) => ({ ...e, [appId]: r.error ?? 'Something went wrong.' }));
      } catch {
        setErrors((e) => ({ ...e, [appId]: 'Something went wrong.' }));
      } finally {
        setBusyId(null);
      }
    });
  }

  const term = q.trim().toLowerCase();
  const filtered = term
    ? rows.filter(({ app, proof }) =>
        [app.application_no, app.full_name, app.email, (app as WithCert).certificate_no ?? '', proof?.transaction_ref ?? '']
          .join(' ')
          .toLowerCase()
          .includes(term)
      )
    : rows;

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, email, application no., certificate or UTR…"
        className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>Application</th>
              <th className={th}>Applicant</th>
              <th className={th}>Category</th>
              <th className={th}>Fee</th>
              <th className={th}>Payment proof</th>
              <th className={th}>Payment</th>
              <th className={th}>Status</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Nothing here right now.
                </td>
              </tr>
            )}

            {filtered.map(({ app, proof, proofUrl }) => {
              const proofPending = proof?.status === 'pending';
              const readyForApproval = app.payment_status === 'paid' && app.status === 'pending';
              const busy = pending && busyId === app.id;

              return (
                <tr key={app.id} className="hover:bg-slate-50/60">
                  <td className={td}>
                    <p className="font-mono font-bold text-[#073b66]">{app.application_no}</p>
                    <p className="text-xs text-slate-500">{formatDate(app.created_at)}</p>
                    {(app as WithCert).certificate_no && (
                      <p className="mt-1 font-mono text-[11px] font-semibold text-emerald-700">
                        {(app as WithCert).certificate_no}
                      </p>
                    )}
                  </td>

                  <td className={td}>
                    <p className="font-semibold text-slate-800">{app.full_name}</p>
                    <p className="text-xs text-slate-500">{app.email}</p>
                  </td>

                  <td className={`${td} text-slate-700`}>{app.membership_category}</td>

                  <td className={`${td} font-semibold text-slate-700`}>{inr(app.fee_amount)}</td>

                  <td className={td}>
                    {proof ? (
                      <div className="space-y-0.5">
                        <p className="text-xs">
                          <span className="font-semibold capitalize text-slate-800">{proof.status}</span>
                          <span className="text-slate-500"> · {formatDate(proof.created_at)}</span>
                        </p>
                        {proof.transaction_ref && (
                          <p className="font-mono text-xs text-slate-600">UTR {proof.transaction_ref}</p>
                        )}
                        {proofUrl && (
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-[#0d9488] underline"
                          >
                            View screenshot ↗
                          </a>
                        )}
                        {proof.reviewer_note && (
                          <p className="text-xs text-slate-500">Note: {proof.reviewer_note}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No proof uploaded</span>
                    )}
                  </td>

                  <td className={td}>
                    <StatusBadge value={app.payment_status} />
                  </td>

                  <td className={td}>
                    <StatusBadge value={app.status} />
                    {app.admin_notes && (
                      <p className="mt-1 max-w-[12rem] text-xs text-slate-500">Note: {app.admin_notes}</p>
                    )}
                  </td>

                  <td className={td}>
                    <div className="flex flex-col items-start gap-2">
                      {proofPending && (
                        <div className="flex gap-2">
                          <button
                            disabled={busy}
                            onClick={() => run(app.id, () => approveProof(proof!.id))}
                            className={`${btn} bg-[#0d9488] text-white hover:bg-[#0b7d73]`}
                          >
                            Verify payment
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => {
                              const note =
                                window.prompt('Why is this proof rejected? (shown to the applicant)') ?? null;
                              if (note !== null) run(app.id, () => rejectProof(proof!.id, note));
                            }}
                            className={`${btn} border border-red-300 text-red-700 hover:bg-red-50`}
                          >
                            Reject proof
                          </button>
                        </div>
                      )}

                      {readyForApproval && (
                        <div className="flex gap-2">
                          <button
                            disabled={busy}
                            onClick={() => run(app.id, () => approveApplication(app.id))}
                            className={`${btn} bg-[#073b66] text-white hover:bg-[#0d5b92]`}
                          >
                            Approve
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => {
                              const note =
                                window.prompt('Reason for rejecting this application? (shown to the applicant)') ??
                                null;
                              if (note !== null) run(app.id, () => rejectApplication(app.id, note));
                            }}
                            className={`${btn} border border-red-300 text-red-700 hover:bg-red-50`}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {!proofPending && !readyForApproval && <span className="text-xs text-slate-400">—</span>}

                      {errors[app.id] && <p className="text-xs text-red-600">{errors[app.id]}</p>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}