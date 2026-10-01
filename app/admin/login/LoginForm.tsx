// Path: app/admin/login/LoginForm.tsx
'use client';

import { useActionState } from 'react';
import { login } from './actions';

const inputCls =
  'rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20';

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="next" value={next ?? ''} />

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
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}