'use client';

// Path: app/membership/login/LoginForm.tsx
import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import { ErrorNote, SubmitButton, inputCls, labelCls, linkCls } from '@/components/form-ui';
import { memberLoginAny } from '../reference-login';
import { resetPasswordWithCode, sendResetCode } from '../forgot-password';

type Method = 'password' | 'dob' | 'reference';

const TABS: { id: Method; label: string }[] = [
  { id: 'password', label: 'Password' },
  { id: 'dob', label: 'Date of birth' },
  { id: 'reference', label: 'Reference no.' },
];

function ForgotPanel({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [info, setInfo] = useState<string | undefined>();
  const [pending, start] = useTransition();

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    setError(undefined);
    setInfo(undefined);
    start(async () => {
      const r = await sendResetCode(email);
      if (r.error) return setError(r.error);
      setStep('code');
      setInfo(`If ${email.trim().toLowerCase()} is registered with MOA, a code is on its way.`);
    });
  }

  function reset(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    start(async () => {
      // On success the server action redirects to the dashboard
      const r = await resetPasswordWithCode({ email, code, password, confirm });
      if (r?.error) setError(r.error);
    });
  }

  return (
    <div className="grid gap-5">
      {/* <div>
        <h2 className="text-xl font-black text-[#073b66]">Forgot password</h2>
        <p className="mt-1 text-sm text-slate-600">
          {step === 'email'
            ? 'Enter your email and we will send you a verification code.'
            : 'Enter the code from your email and choose a new password.'}
        </p>
      </div> */}

      {step === 'email' ? (
        <form onSubmit={send} className="grid gap-5">
          <label className={labelCls}>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </label>
          {error && <ErrorNote>{error}</ErrorNote>}
          <SubmitButton pending={pending} idle="Send code" busy="Sending…" />
        </form>
      ) : (
        <form onSubmit={reset} className="grid gap-5">
          {info && (
            <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">{info}</p>
          )}
          <label className={labelCls}>
            Verification code
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={`${inputCls} tracking-widest`}
            />
          </label>
          <label className={labelCls}>
            New password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Confirm password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
            />
          </label>
          {error && <ErrorNote>{error}</ErrorNote>}
          <SubmitButton pending={pending} idle="Reset password" busy="Resetting…" />
          <button
            type="button"
            disabled={pending}
            onClick={() => send()}
            className="text-sm font-semibold text-[#0d9488] hover:underline disabled:opacity-60"
          >
            Resend code
          </button>
        </form>
      )}

      <button type="button" onClick={onBack} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
        ← Back to login
      </button>
    </div>
  );
}

export default function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(memberLoginAny, undefined);
  const [method, setMethod] = useState<Method>('password');
  const [forgot, setForgot] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  if (forgot) return <ForgotPanel onBack={() => setForgot(false)} />;

  return (
    <form action={formAction} className="grid gap-5">
      {notice && !state?.error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>
      )}

      <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-3 gap-1 rounded-xl bg-tint p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={method === t.id}
            onClick={() => setMethod(t.id)}
            className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
              method === t.id ? 'bg-white text-brand-dark shadow-sm' : 'text-muted hover:text-brand-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input type="hidden" name="method" value={method} />

      <label className={labelCls}>
        Email
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </label>

      {method === 'password' && (
        <div className="grid gap-2">
          <label className={labelCls}>
            Password
            <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
          </label>
          {/* <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-muted">
              No password yet? Use the “Date of birth” or “Reference no.” tab. You can create a password after
              logging in.
            </p>
            <button
              type="button"
              onClick={() => setForgot(true)}
              className={`${linkCls} shrink-0 text-xs font-semibold`}
            >
              Forgot password?
            </button>
          </div> */}
        </div>
      )}

      {method === 'dob' && (
        <div className="grid gap-2">
          <label className={labelCls}>
            Date of birth
            <input name="date_of_birth" type="date" required max={today} autoComplete="bday" className={inputCls} />
          </label>
          <p className="text-xs text-muted">For members: use the email and date of birth from your application.</p>
        </div>
      )}

      {method === 'reference' && (
        <div className="grid gap-2">
          <label className={labelCls}>
            Registration / reference number
            <input
              name="reference_no"
              required
              placeholder="STU-2026-123456"
              autoCapitalize="characters"
              autoComplete="off"
              className={`${inputCls} uppercase`}
            />
          </label>
          <p className="text-xs text-muted">
            For institute, student and clinic registrations: use the email you registered with and the reference
            number shown after you registered.
          </p>
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
          {' · '}
          <Link href="/register" className={linkCls}>
            Register
          </Link>
        </p>
      </div>
    </form>
  );
}