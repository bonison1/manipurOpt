// Path: app/membership/login/LoginForm.tsx
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { memberLogin } from '../auth-actions';

const inputCls =
  'rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20';

export default function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(memberLogin, undefined);

  return (
    <form action={formAction} className="grid gap-5">
      {notice && !state?.error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>
      )}

      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
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
        {pending ? 'Signing in…' : 'Log in'}
      </button>

      <div className="grid gap-1 text-center text-sm text-slate-600">
        <p>
          Applied but no account yet?{' '}
          <Link href="/membership/signup" className="font-semibold text-[#0d9488] hover:underline">
            Create your account
          </Link>
        </p>
        <p>
          Started an application but didn’t finish?{' '}
          <Link href="/membership/apply/resume" className="font-semibold text-[#0d9488] hover:underline">
            Continue application
          </Link>
        </p>
        <p>
          Not a member yet?{' '}
          <Link href="/membership/apply" className="font-semibold text-[#0d9488] hover:underline">
            Apply for membership
          </Link>
        </p>
      </div>
    </form>
  );
}