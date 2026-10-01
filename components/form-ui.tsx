// Path: components/form-ui.tsx
import type { ReactNode } from 'react';

export const inputCls =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

export const labelCls = 'grid gap-2 text-sm font-semibold';

export const linkCls = 'font-semibold text-brand hover:text-brand-dark hover:underline';

/** Centered page body: pick the width that suits the form. */
export function PageBody({
  width = 'max-w-md',
  children,
}: {
  width?: 'max-w-md' | 'max-w-2xl' | 'max-w-4xl';
  children: ReactNode;
}) {
  return (
    <section className="wrap py-12 md:py-16">
      <div className={`mx-auto ${width}`}>{children}</div>
    </section>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-white p-6 md:p-8 ${className}`}>{children}</div>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {children}
    </p>
  );
}

export function SubmitButton({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? busy : idle}
    </button>
  );
}