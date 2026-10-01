// Path: app/admin/admins/AddAdminForm.tsx
'use client';

import { useActionState, useState } from 'react';
import { addAdmin } from './actions';

const inputCls =
  'w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20';

export default function AddAdminForm() {
  const [state, formAction, pending] = useActionState(addAdmin, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Email address
        <input
          name="email"
          type="email"
          required
          autoComplete="off"
          placeholder="name@example.com"
          className={inputCls}
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        <span>
          Temporary password <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={`${inputCls} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <span className="text-xs font-normal text-slate-500">
          Share it with them privately and ask them to change it after signing in.
        </span>
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Adding…' : 'Add admin'}
      </button>
    </form>
  );
}