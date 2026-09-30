// Path: app/membership/PayButton.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { getProofStatus, submitPaymentProof, type ProofStatus } from './payment-actions';
import { inr } from '@/lib/format';

// CHANGE: put your real details here (or move to constants.ts / env vars).
const PAYMENT = {
  qrImage: '/payment-qr.png', // place the file in /public
  upiId: 'yourname@upi',
  accountName: 'Your Organisation Name',
  bankName: 'Your Bank',
  accountNumber: '0000000000',
  ifsc: 'ABCD0123456',
};

const MAX_MB = 4;

type Props = {
  applicationNo: string;
  email: string;
  amount: number;
  onPaid?: () => void; // called after proof is uploaded (TrackForm refreshes status)
};

export default function PayButton({ applicationNo, email, amount, onPaid }: Props) {
  const [proof, setProof] = useState<ProofStatus | null>(null); // null = still checking
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [pending, startTransition] = useTransition();

  // Ask the server if a proof was already uploaded for this registration number
  useEffect(() => {
    let cancelled = false;
    setProof(null);
    getProofStatus(applicationNo, email)
      .then((s) => !cancelled && setProof(s))
      .catch(() => !cancelled && setProof({ status: 'none' }));
    return () => {
      cancelled = true;
    };
  }, [applicationNo, email]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('applicationNo', applicationNo);
    fd.set('email', email);

    startTransition(async () => {
      try {
        const res = await submitPaymentProof(fd);
        if (res.ok) {
          setProof({ status: 'pending' });
          setOpen(false);
          onPaid?.();
        } else {
          setError(res.error ?? 'Something went wrong. Please try again.');
        }
      } catch {
        setError(`Upload failed. Make sure the file is under ${MAX_MB} MB and try again.`);
      }
    });
  }

  // Still checking: render nothing so the Pay button doesn't flash
  if (proof === null) return null;

  // Proof already uploaded: no Pay button
  if (proof.status === 'pending' || proof.status === 'approved') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <p className="font-semibold">
          {proof.status === 'approved' ? 'Payment verified' : 'Payment proof submitted'}
        </p>
        <p className="mt-1">
          {proof.status === 'approved'
            ? 'Your payment has been verified.'
            : 'We will verify it and update your application status shortly.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {proof.status === 'rejected' && (
        <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Your previous payment proof was not accepted{proof.note ? `: ${proof.note}` : '.'} Please upload a new one.
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73]"
      >
        Pay {inr(amount)}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold">Complete your payment</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-slate-500">
                ✕
              </button>
            </div>

            <p className="mb-3 text-sm">
              Amount to pay: <strong>{inr(amount)}</strong>
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PAYMENT.qrImage} alt="Payment QR code" className="mx-auto mb-2 h-48 w-48 object-contain" />
            <p className="mb-4 text-center text-sm">
              UPI ID: <CopyText value={PAYMENT.upiId} />
            </p>

            <div className="mb-5 rounded-xl border border-slate-200 p-3 text-sm">
              <p className="mb-2 font-medium">Or pay by bank transfer</p>
              <Row label="Account name" value={PAYMENT.accountName} />
              <Row label="Bank" value={PAYMENT.bankName} />
              <Row label="Account no." value={PAYMENT.accountNumber} copy />
              <Row label="IFSC" value={PAYMENT.ifsc} copy />
              <Row label="Reference" value={applicationNo} copy />
            </div>

            <form onSubmit={onSubmit} className="grid gap-3">
              <p className="text-sm font-medium">After paying, upload your proof</p>

              <label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm">
                {fileName || 'Choose screenshot or PDF (max 4 MB)'}
                <input
                  name="proof"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  required
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size > MAX_MB * 1024 * 1024) {
                      setError(`File is too large. Please choose a file under ${MAX_MB} MB.`);
                      e.target.value = '';
                      setFileName('');
                      return;
                    }
                    setError(null);
                    setFileName(f?.name ?? '');
                  }}
                />
              </label>

              <input
                name="transactionRef"
                placeholder="UTR / Transaction reference (optional)"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
              />

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-[#0d9488] py-3 font-semibold text-white transition hover:bg-[#0b7d73] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Uploading…' : 'Submit payment proof'}
              </button>
              <p className="text-xs text-slate-500">
                Your payment will be verified by our team before the review begins.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function CopyText({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="font-mono underline"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? 'Copied!' : value}
    </button>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-slate-500">{label}</span>
      {copy ? <CopyText value={value} /> : <span className="text-right">{value}</span>}
    </div>
  );
}