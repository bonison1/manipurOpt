'use client';

// Path: app/membership/dashboard/CreateRegistrationPasswordModal.tsx

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorNote, SubmitButton, inputCls, labelCls } from '@/components/form-ui';
import { setRegistrationPassword } from './registration-password';

export function CreateRegistrationPasswordModal() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(setRegistrationPassword, undefined);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  if (dismissed || state?.ok) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-password-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="create-password-title" className="text-xl font-black text-[#073b66]">
          Create a password
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Set a password so you can log in with your email and password next time, without your reference number.
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
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Confirm password
            <input
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputCls}
            />
          </label>

          {state?.error && <ErrorNote>{state.error}</ErrorNote>}

          <SubmitButton pending={pending} idle="Save password" busy="Saving…" />

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRegistrationPasswordModal;