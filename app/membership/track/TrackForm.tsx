// Path: app/membership/track/TrackForm.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import PayButton from '../PayButton';
import { getProofStatus, type ProofStatus } from '../payment-actions';
import StatusBadge from '@/components/StatusBadge';
import { ErrorNote, inputCls, labelCls, linkCls } from '@/components/form-ui';
import { formatDate, inr } from '@/lib/format';
import { trackAny } from './track-actions';
import type { OwnRegistration, TrackedItem } from './track-types';

const primaryBtn =
  'inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60';

function headline(a: TrackedItem, proofSubmitted: boolean) {
  const isMembership = a.kind === 'membership';
  if (a.status === 'approved')
    return isMembership ? 'Your membership has been approved.' : 'Your registration has been approved.';
  if (a.status === 'rejected')
    return isMembership ? 'Your application was not approved.' : 'Your registration was not approved.';
  if (a.payment_status === 'unpaid' && proofSubmitted)
    return 'Payment proof received. We will verify it shortly.';
  if (a.payment_status === 'unpaid') return 'Complete your payment so the review can begin.';
  return `Payment received. Your ${isMembership ? 'application' : 'registration'} is waiting for admin review.`;
}

type Member = { applicationNo: string; email: string; isDraft: boolean } | null;

export default function TrackForm({
  member = null,
  signedIn = false,
  registrations = [],
}: {
  /** Application the visitor may see without typing anything (logged in / resumed draft). */
  member?: Member;
  signedIn?: boolean;
  /** Institute / student / clinic registrations tied to the logged-in email. */
  registrations?: OwnRegistration[];
}) {
  const [isPending, startTransition] = useTransition();
  const [app, setApp] = useState<TrackedItem | null>(null);
  const [proof, setProof] = useState<ProofStatus>({ status: 'none' });
  const [error, setError] = useState('');
  const [creds, setCreds] = useState({ no: member?.applicationNo ?? '', email: member?.email ?? '' });

  // Members see their own status straight away; others (or anyone who asks) get the form.
  const autoTrack = !!member && !member.isDraft;
  const hasOwn = !!member || registrations.length > 0;
  const [showManual, setShowManual] = useState(!hasOwn);
  const [autoFailed, setAutoFailed] = useState(false);

  // A proof counts as "submitted" while pending or once approved
  const proofSubmitted = proof.status === 'pending' || proof.status === 'approved';

  function lookup(no: string, email: string, fromLogin = false) {
    setCreds({ no, email });
    startTransition(async () => {
      const result = await trackAny(no, email);
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
    lookup(String(fd.get('application_no') ?? ''), String(fd.get('email') ?? ''));
  }

  const isMembership = app?.kind === 'membership';
  const feePaid = app?.payment_status === 'paid';

  const steps = app
    ? [
        {
          label: isMembership ? 'Application submitted' : 'Registration submitted',
          done: true,
          detail: formatDate(app.created_at),
        },
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-tint px-4 py-3 text-sm">
          <span>Have a member account? Log in and your status appears automatically.</span>
          <Link href="/membership/login" className={linkCls}>
            Log in →
          </Link>
        </div>
      )}

      {/* ── Logged in, but nothing found for this email ── */}
      {signedIn && !hasOwn && (
        <p className="rounded-2xl bg-tint px-4 py-3 text-sm">
          We couldn&apos;t find an application or registration for your account email. Enter the reference
          number and email below, or{' '}
          <Link href="/membership/apply" className={linkCls}>
            start a new application
          </Link>
          .
        </p>
      )}

      {/* ── Unfinished application (logged in, or resumed with email + date of birth) ── */}
      {member?.isDraft && (
        <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5">
          <p className="font-mono text-lg font-bold">{member.applicationNo}</p>
          <p className="font-semibold">Your application is not finished yet.</p>
          <p className="text-sm text-muted">
            Your saved answers are waiting. Continue from where you stopped and submit to start the review.
          </p>
          <div>
            <Link href="/membership/apply?resume=1" className={primaryBtn}>
              Continue application
            </Link>
          </div>
        </div>
      )}

      {/* ── Institute / student / clinic registrations on the logged-in email ── */}
      {registrations.length > 0 && (
        <div className="grid gap-2">
          <p className="text-sm font-semibold">Your registrations</p>
          <ul className="grid gap-2">
            {registrations.map((r) => (
              <li key={r.referenceNo}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => lookup(r.referenceNo, r.email)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-4 py-3 text-left text-sm transition-colors hover:border-brand hover:bg-tint disabled:opacity-60"
                >
                  <span className="font-mono font-bold">{r.referenceNo}</span>
                  <span className="text-muted">{r.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loadingOwn && <p className="text-sm text-muted">Loading your application…</p>}

      {/* ── Manual lookup (reference number + email) ── */}
      {hasOwn && !showManual ? (
        <button type="button" onClick={() => setShowManual(true)} className={`justify-self-start text-sm ${linkCls}`}>
          Look up a different application or registration
        </button>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-5">
          {autoFailed && (
            <p className="text-sm text-muted">
              We couldn&apos;t load your application automatically. You can look it up manually:
            </p>
          )}
          <label className={labelCls}>
            Registration / reference number
            <input
              name="application_no"
              required
              placeholder="MOA-2026-00001 or STU-2026-123456"
              autoCapitalize="characters"
              className={`${inputCls} uppercase`}
            />
          </label>
          <label className={labelCls}>
            Email used in the application
            <input name="email" type="email" required placeholder="Email" className={inputCls} />
          </label>
          <div>
            <button type="submit" disabled={isPending} className={primaryBtn}>
              {isPending ? 'Checking…' : 'Check status'}
            </button>
          </div>
          {error && !autoFailed && <ErrorNote>{error}</ErrorNote>}
        </form>
      )}

      {/* Errors from the automatic lookup (form is shown above as a fallback) */}
      {error && autoFailed && <ErrorNote>{error}</ErrorNote>}
      {/* Error from clicking one of "Your registrations" while the form is hidden */}
      {error && !autoFailed && !showManual && <ErrorNote>{error}</ErrorNote>}

      {app && (
        <div className="grid gap-6 border-t border-line pt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-lg font-bold">{app.application_no}</p>
              <p className="text-sm text-muted">
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

          <p className="font-display text-lg font-bold">{headline(app, proofSubmitted)}</p>

          {/* Member card / certificate only exists for memberships */}
          {isMembership && app.status === 'approved' && (
            <Link href={signedIn ? '/membership/dashboard' : '/membership/login'} className={`text-sm ${linkCls}`}>
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
                    s.done ? 'bg-brand text-white' : 'border border-line text-muted'
                  }`}
                >
                  {s.done ? '✓' : ''}
                </span>
                <span>
                  <span className="font-semibold">{s.label}</span>
                  <span className="block text-muted">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          {app.admin_notes && (
            <div className="rounded-2xl bg-tint px-4 py-3 text-sm">
              <p className="font-semibold">Note from MOA</p>
              <p className="mt-1 whitespace-pre-wrap text-muted">{app.admin_notes}</p>
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