// Path: app/membership/apply/resume/ResumeForm.tsx
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { ErrorNote, SubmitButton, inputCls, labelCls, linkCls } from '@/components/form-ui';
import { resumeApplication } from '../../apply-actions';

export default function ResumeForm() {
  const [state, formAction, pending] = useActionState(resumeApplication, undefined);
  const today = new Date().toISOString().split('T')[0];

  return (
    <form action={formAction} className="grid gap-5">
      <label className={labelCls}>
        Email
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </label>
      <label className={labelCls}>
        Date of birth
        <input name="date_of_birth" type="date" required max={today} autoComplete="bday" className={inputCls} />
      </label>

      {state?.error && <ErrorNote>{state.error}</ErrorNote>}

      <SubmitButton pending={pending} idle="Continue application" busy="Checking…" />

      <div className="grid gap-1 text-center text-sm text-muted">
        <p>
          Have a member account?{' '}
          <Link href="/membership/login" className={linkCls}>
            Log in
          </Link>
        </p>
        <p>
          New here?{' '}
          <Link href="/membership/apply" className={linkCls}>
            Start a new application
          </Link>
        </p>
      </div>
    </form>
  );
}