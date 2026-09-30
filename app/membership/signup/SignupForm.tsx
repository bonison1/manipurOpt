// Path: app/membership/signup/SignupForm.tsx
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { memberSignup } from '../auth-actions';

const inputCls =
  'rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20';

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(memberSignup, undefined);

  if (state?.success) {
    return (
      <div className="grid gap-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0d9488]">Almost done</p>
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{state.success}</p>
        <Link href="/membership/login" className="font-semibold text-[#0d9488] hover:underline">
          Go to login →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
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
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className={inputCls}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Confirm password
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
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
        {pending ? 'Creating account…' : 'Create account'}
      </button>

      <div className="grid gap-1 text-center text-sm text-slate-600">
        <p>
          Already have an account?{' '}
          <Link href="/membership/login" className="font-semibold text-[#0d9488] hover:underline">
            Log in
          </Link>
        </p>
        <p>
          Haven’t applied yet?{' '}
          <Link href="/membership/apply" className="font-semibold text-[#0d9488] hover:underline">
            Apply for membership
          </Link>
        </p>
      </div>
    </form>
  );
}