// Path: app/membership/apply/resume/ResumeForm.tsx
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { resumeApplication } from '../../apply-actions';

const inputCls =
  'rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20';

export default function ResumeForm() {
  const [state, formAction, pending] = useActionState(resumeApplication, undefined);
  const today = new Date().toISOString().split('T')[0];

  return (
    <form action={formAction} className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Date of birth
        <input name="date_of_birth" type="date" required max={today} autoComplete="bday" className={inputCls} />
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Checking…' : 'Continue application'}
      </button>

      <div className="grid gap-1 text-center text-sm text-slate-600">
        <p>
          Have a member account?{' '}
          <Link href="/membership/login" className="font-semibold text-[#0d9488] hover:underline">
            Log in
          </Link>
        </p>
        <p>
          New here?{' '}
          <Link href="/membership/apply" className="font-semibold text-[#0d9488] hover:underline">
            Start a new application
          </Link>
        </p>
      </div>
    </form>
  );
}
