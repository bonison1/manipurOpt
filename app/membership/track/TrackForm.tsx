// Path: app/membership/track/TrackForm.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { trackApplication } from '../actions';
import type { TrackedApplication } from '../constants';
import PayButton from '../PayButton';
import { getProofStatus, type ProofStatus } from '../payment-actions';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, inr } from '@/lib/format';

const inputCls =
  'rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20';

const primaryBtn =
  'inline-flex items-center justify-center rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73] disabled:cursor-not-allowed disabled:opacity-60';

function headline(a: TrackedApplication, proofSubmitted: boolean) {
  if (a.status === 'approved') return 'Your membership has been approved.';
  if (a.status === 'rejected') return 'Your application was not approved.';
  if (a.payment_status === 'unpaid' && proofSubmitted)
    return 'Payment proof received. We will verify it shortly.';
  if (a.payment_status === 'unpaid') return 'Complete your payment so the review can begin.';
  return 'Payment received. Your application is waiting for admin review.';
}

type Member = { applicationNo: string; email: string; isDraft: boolean } | null;

export default function TrackForm({
  member = null,
  signedIn = false,
}: {
  /** Application the visitor may see without typing anything (logged in / resumed draft). */
  member?: Member;
  signedIn?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [app, setApp] = useState<TrackedApplication | null>(null);
  const [proof, setProof] = useState<ProofStatus>({ status: 'none' });
  const [error, setError] = useState('');
  const [creds, setCreds] = useState({ no: member?.applicationNo ?? '', email: member?.email ?? '' });

  // Members see their own status straight away; others (or anyone who asks) get the form.
  const autoTrack = !!member && !member.isDraft;
  const [showManual, setShowManual] = useState(!member);
  const [autoFailed, setAutoFailed] = useState(false);

  // A proof counts as "submitted" while pending or once approved
  const proofSubmitted = proof.status === 'pending' || proof.status === 'approved';

  function lookup(no: string, email: string, fromLogin = false) {
    startTransition(async () => {
      const result = await trackApplication(no, email);
      if (result.ok && result.application) {
        const p = await getProofStatus(no, email).catch(() => ({ status: 'none' }) as ProofStatus);
        setApp(result.application);
        setProof(p);
        setError('');
      } else {
        setApp(null);
        setProof({ status: 'none' });
        setError(result.message ?? 'Application not found.');
        if (fromLogin) {
          setAutoFailed(true);
          setShowManual(true);
        }
      }
    });
  }

  // Logged-in member: look up their application automatically on load
  useEffect(() => {
    if (autoTrack && member) lookup(member.applicationNo, member.email, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const no = String(fd.get('application_no') ?? '');
    const email = String(fd.get('email') ?? '');
    setCreds({ no, email });
    lookup(no, email);
  }

  const feePaid = app?.payment_status === 'paid';

  const steps = app
    ? [
        { label: 'Application submitted', done: true, detail: formatDate(app.created_at) },
        {
          label: 'Fee paid',
          done: feePaid || proofSubmitted,
          detail: feePaid
            ? inr(app.fee_amount)
            : proofSubmitted
              ? `${inr(app.fee_amount)} · proof submitted, awaiting verification`
              : `${inr(app.fee_amount)} due`,
        },
        {
          label: 'Admin review',
          done: app.status !== 'pending',
          detail: app.status === 'pending' ? 'Waiting' : formatDate(app.reviewed_at),
        },
      ]
    : [];

  const loadingOwn = autoTrack && isPending && !app && !autoFailed;

  return (
    <div className="grid gap-8">
      {/* ── Not logged in: offer login as the quick way ── */}
      {!member && !signedIn && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-slate-700">
          <span>Have a member account? Log in and your status appears automatically.</span>
          <Link href="/membership/login" className="font-semibold text-[#0d9488] hover:underline">
            Log in →
          </Link>
        </div>
      )}

      {/* ── Logged in, but no application found for this email ── */}
      {signedIn && !member && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          We couldn&apos;t find an application for your account email. Enter the registration number and
          email of your application below, or{' '}
          <Link href="/membership/apply" className="font-semibold text-[#0d9488] hover:underline">
            start a new application
          </Link>
          .
        </p>
      )}

      {/* ── Unfinished application (logged in, or resumed with email + date of birth) ── */}
      {member?.isDraft && (
        <div className="grid gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-5">
          <p className="font-mono text-lg font-bold text-[#073b66]">{member.applicationNo}</p>
          <p className="font-semibold text-[#073b66]">Your application is not finished yet.</p>
          <p className="text-sm text-slate-700">
            Your saved answers are waiting. Continue from where you stopped and submit to start the review.
          </p>
          <div>
            <Link href="/membership/apply" className={primaryBtn}>
              Continue application
            </Link>
          </div>
        </div>
      )}

      {loadingOwn && <p className="text-sm text-slate-600">Loading your application…</p>}

      {/* ── Manual lookup (registration number + email) ── */}
      {member && !showManual ? (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="justify-self-start text-sm font-semibold text-[#0d9488] hover:underline"
        >
          Look up a different application
        </button>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-5">
          {autoFailed && (
            <p className="text-sm text-slate-600">
              We couldn&apos;t load your application automatically. You can look it up manually:
            </p>
          )}
          <label className="grid gap-2 text-sm font-semibold">
            Registration number
            <input
              name="application_no"
              required
              placeholder="MOA-2026-00001"
              autoCapitalize="characters"
              className={`${inputCls} uppercase`}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Email used in the application
            <input name="email" type="email" required placeholder="Email" className={inputCls} />
          </label>
          <div>
            <button type="submit" disabled={isPending} className={primaryBtn}>
              {isPending ? 'Checking…' : 'Check status'}
            </button>
          </div>
          {error && !autoFailed && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      )}

      {/* Errors from the automatic lookup (form is shown above as a fallback) */}
      {error && autoFailed && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {app && (
        <div className="grid gap-6 border-t pt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-lg font-bold text-[#073b66]">{app.application_no}</p>
              <p className="text-sm text-slate-600">
                {app.full_name} · {app.membership_category}
              </p>
            </div>
            <div className="flex gap-2">
              <StatusBadge
                value={app.payment_status}
                label={app.payment_status === 'unpaid' && proofSubmitted ? 'Verifying' : undefined}
              />
              <StatusBadge
                value={app.status}
                label={app.status === 'pending' ? 'Under review' : undefined}
              />
            </div>
          </div>

          <p className="font-semibold text-[#073b66]">{headline(app, proofSubmitted)}</p>

          {app.status === 'approved' && (
            <Link
              href={signedIn ? '/membership/dashboard' : '/membership/login'}
              className="text-sm font-semibold text-[#0d9488] hover:underline"
            >
              {signedIn
                ? 'Open your member dashboard to see your card and certificate number →'
                : 'Log in to see your member card and certificate number →'}
            </Link>
          )}

          <ol className="grid gap-3">
            {steps.map((s) => (
              <li key={s.label} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    s.done ? 'bg-[#0d9488] text-white' : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {s.done ? '✓' : ''}
                </span>
                <span>
                  <span className="font-semibold text-slate-800">{s.label}</span>
                  <span className="block text-slate-500">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          {app.admin_notes && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">Note from MOA</p>
              <p className="mt-1 whitespace-pre-wrap">{app.admin_notes}</p>
            </div>
          )}

          {app.payment_status === 'unpaid' && app.status !== 'rejected' && (
            <PayButton
              applicationNo={app.application_no}
              email={creds.email}
              amount={app.fee_amount}
              onPaid={() => lookup(creds.no, creds.email)}
            />
          )}
        </div>
      )}
    </div>
  );
}
