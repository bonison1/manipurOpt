// Path: app/membership/dashboard/CreatePasswordModal.tsx
'use client';

import { useActionState, useState } from 'react';
import { ErrorNote, SubmitButton, inputCls, labelCls } from '@/components/form-ui';
import { createPassword } from '../auth-actions';

export default function CreatePasswordModal() {
  const [open, setOpen] = useState(true);
  const [state, formAction, pending] = useActionState(createPassword, undefined);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="create-password-title" className="font-display text-xl font-bold text-brand-dark">
          Create your password
        </h2>
        <p className="mt-2 text-sm text-muted">
          You are signed in with your date of birth. Set a password so you can log in with your email and password
          next time.
        </p>

        <form action={formAction} className="mt-5 grid gap-4">
          <label className={labelCls}>
            New password
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
          <label className={labelCls}>
            Confirm password
            <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
          </label>

          {state?.error && <ErrorNote>{state.error}</ErrorNote>}

          <SubmitButton pending={pending} idle="Save password" busy="Saving…" />

          <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:underline">
            Maybe later
          </button>
        </form>
      </div>
    </div>
  );
}
