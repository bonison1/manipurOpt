'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { approveProof, getProofUrl, rejectProof } from '@/app/membership/payment-actions';

export default function ProofActions({ proofId, filePath }: { proofId: string; filePath: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? 'Failed.');
      else router.refresh();
    });
  }

  async function view() {
    const url = await getProofUrl(filePath);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else setError('Could not open the proof.');
  }

  const btn = 'rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-50';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={view} className={`${btn} border-line`}>
        View proof
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => approveProof(proofId))}
        className={`${btn} border-emerald-300 bg-emerald-50 text-emerald-800`}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const note = window.prompt('Reason for rejecting this proof?');
          if (note && note.trim()) run(() => rejectProof(proofId, note.trim()));
        }}
        className={`${btn} border-red-300 bg-red-50 text-red-700`}
      >
        Reject
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}