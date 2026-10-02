///Users/macbook/Downloads/moa-website/app/register/RegistrationForm.tsx
'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { ErrorNote, SubmitButton, inputCls as baseInputCls, labelCls, linkCls } from '@/components/form-ui';
import { inr } from '@/lib/format';
import PayButton from '../membership/PayButton';
import { submitRegistration } from './actions';
import type { RegConfig } from './config';

const inputCls = `${baseInputCls} aria-[invalid=true]:border-red-500`;

function SuccessCard({
  referenceNo, email, feeAmount,
}: {
  referenceNo: string;
  email: string;
  feeAmount: number;
}) {
  const [paid, setPaid] = useState(false);

  return (
    <div className="grid gap-6 text-center">
      <div>
        <p className="text-sm font-semibold text-brand">Registration submitted</p>
        <h3 className="mt-2 font-display text-2xl font-bold">Your reference number</h3>
        <p className="mt-4 inline-block rounded-2xl border border-dashed border-brand bg-tint px-6 py-4 font-mono text-2xl font-bold tracking-wider">
          {referenceNo}
        </p>
        <p className="mt-3 text-sm text-muted">
          Save this number{email ? ` — you will need it with your email (${email})` : ''} to complete payment and for any follow-up.
        </p>
      </div>

      {feeAmount > 0 &&
        (paid ? (
          <p className="rounded-2xl bg-tint px-4 py-3 font-semibold text-brand-dark">
            Payment proof for {inr(feeAmount)} submitted. Your registration is now waiting for admin approval.
          </p>
        ) : (
          <div className="rounded-2xl bg-tint px-4 py-5">
            <p className="text-sm text-muted">
              Registration fee: <strong className="text-ink">{inr(feeAmount)}</strong>. Your registration is reviewed once the fee is paid.
            </p>
            <div className="mt-4 flex justify-center">
              <PayButton applicationNo={referenceNo} email={email} amount={feeAmount} onPaid={() => setPaid(true)} />
            </div>
          </div>
        ))}

      <Link href="/register" className={`text-sm ${linkCls}`}>
        ← Back to registrations
      </Link>
    </div>
  );
}

export default function RegistrationForm({ config }: { config: RegConfig }) {
  const [state, formAction, pending] = useActionState(submitRegistration, undefined);

  if (state?.ok) {
    return (
      <SuccessCard
        referenceNo={state.referenceNo ?? ''}
        email={state.email ?? ''}
        feeAmount={state.feeAmount ?? 0}
      />
    );
  }

  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  return (
    <form action={formAction} className="grid gap-5 md:grid-cols-2">
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="type" value={config.type} />

      <p className="rounded-2xl bg-tint px-4 py-3 text-sm md:col-span-2">
        Registration fee: <strong>{inr(config.fee)}</strong> — payable after you submit (QR / bank transfer, then upload the proof).
      </p>

      {config.fields.map((f) => {
        const err = errors[f.name];
        const common = {
          name: f.name,
          required: true,
          defaultValue: values[f.name] ?? '',
          'aria-invalid': !!err,
          'aria-describedby': err ? `${f.name}-error` : undefined,
          className: inputCls,
        };
        const span = f.kind === 'textarea' ? 'md:col-span-2' : '';

        return (
          <label key={f.name} className={`${labelCls} ${span}`}>
            <span>
              {f.label} <span className="text-red-500">*</span>
              {f.hint && <span className="ml-1 text-xs font-normal text-muted">{f.hint}</span>}
            </span>

            {f.kind === 'textarea' ? (
              <textarea {...common} rows={2} maxLength={f.maxLength} placeholder={f.placeholder ?? f.label} className={`${inputCls} min-h-20`} />
            ) : f.kind === 'select' ? (
              <select {...common}>
                <option value="" disabled>
                  Select {f.label.toLowerCase()}
                </option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...common}
                type={f.kind}
                inputMode={f.kind === 'tel' ? 'tel' : f.kind === 'email' ? 'email' : undefined}
                autoComplete={f.autoComplete}
                maxLength={f.maxLength}
                pattern={f.pattern}
                placeholder={f.placeholder ?? f.label}
              />
            )}

            {err && (
              <span id={`${f.name}-error`} role="alert" className="text-xs font-normal text-red-600">
                {err}
              </span>
            )}
          </label>
        );
      })}

      {state?.error && (
        <div className="md:col-span-2">
          <ErrorNote>{state.error}</ErrorNote>
        </div>
      )}

      <div className="md:col-span-2">
        <SubmitButton pending={pending} idle="Submit & continue to payment" busy="Submitting…" />
      </div>
    </form>
  );
}