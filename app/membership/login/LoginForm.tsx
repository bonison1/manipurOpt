// Path: app/membership/login/LoginForm.tsx
'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { ErrorNote, SubmitButton, inputCls, labelCls, linkCls } from '@/components/form-ui';
import { memberLogin } from '../auth-actions';

type Method = 'password' | 'dob';

const TABS: { id: Method; label: string }[] = [
  { id: 'password', label: 'Email & password' },
  { id: 'dob', label: 'Email & date of birth' },
];

export default function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(memberLogin, undefined);
  const [method, setMethod] = useState<Method>('password');
  const today = new Date().toISOString().split('T')[0];

  return (
    <form action={formAction} className="grid gap-5">
      {notice && !state?.error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>
      )}

      {/* Sign-in method */}
      <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-2 gap-1 rounded-xl bg-tint p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={method === t.id}
            onClick={() => setMethod(t.id)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              method === t.id ? 'bg-white text-brand-dark shadow-sm' : 'text-muted hover:text-brand-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input type="hidden" name="method" value={method} />

      {/* Rendered once so the typed email survives switching tabs */}
      <label className={labelCls}>
        Email
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </label>

      {method === 'password' ? (
        <div className="grid gap-2">
          <label className={labelCls}>
            Password
            <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
          </label>
          <p className="text-xs text-muted">
            No password yet? Use the “Email &amp; date of birth” tab. You can create a password after logging in.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          <label className={labelCls}>
            Date of birth
            <input
              name="date_of_birth"
              type="date"
              required
              max={today}
              autoComplete="bday"
              className={inputCls}
            />
          </label>
          <p className="text-xs text-muted">Use the email and date of birth from your application.</p>
        </div>
      )}

      {state?.error && <ErrorNote>{state.error}</ErrorNote>}

      <SubmitButton pending={pending} idle="Log in" busy="Signing in…" />

      <div className="grid gap-1 text-center text-sm text-muted">
        <p>
          Not a member yet?{' '}
          <Link href="/membership/apply" className={linkCls}>
            Apply for membership
          </Link>
        </p>
      </div>
    </form>
  );
}
