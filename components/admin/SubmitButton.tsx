'use client';

import { useFormStatus } from 'react-dom';

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/** Submit button: disables itself and shows a spinner while the form is submitting. */
export function SubmitButton({
  children,
  pendingText = 'Saving...',
  className = '',
  disabled = false,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending && <Spinner />}
      {pending ? pendingText : children}
    </button>
  );
}

/** Full-screen overlay that blocks all clicks while the parent form is submitting. */
export function PendingOverlay({ text = 'Saving...' }: { text?: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex cursor-wait items-center justify-center bg-white/60 backdrop-blur-sm"
    >
      <div className="w-64 rounded-xl border bg-white px-5 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5 text-[#073b66]" />
          <span className="text-sm font-semibold text-[#073b66]">{text}</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#073b66]" />
        </div>
      </div>
    </div>
  );
}