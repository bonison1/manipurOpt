// Path: app/membership/MembershipForm.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  createDocumentUpload,
  exitApplication,
  finalizeApplication,
  saveDocuments,
  saveStep,
} from './apply-actions';
import {
  CATEGORIES,
  DISTRICTS,
  FEES,
  GENDERS,
  HIGHEST_QUALIFICATIONS,
  MAX_DOCS_BYTES,
  STEP_FIELDS,
  type DraftData,
  type FormState,
} from './constants';
import PayButton from './PayButton';
import { inr } from '@/lib/format';

const inputCls =
  'w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 aria-[invalid=true]:border-red-500';
const fileCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-[#0d9488] aria-[invalid=true]:border-red-500';

/* ───────── Steps ───────── */

const STEPS = [
  { title: 'Personal', heading: 'Personal details' },
  { title: 'Identity & Work', heading: 'Identity, address & work details' },
  { title: 'Education', heading: 'Educational details' },
  { title: 'Documents', heading: 'Upload documents' },
  { title: 'Review', heading: 'Review & submit' },
] as const;

const LAST = STEPS.length - 1;

const STEP_OF: Record<string, number> = {};
STEP_FIELDS.forEach((fields, i) => fields.forEach((f) => (STEP_OF[f] = i)));

const LABELS: Record<string, string> = {
  full_name: 'Full name',
  date_of_birth: 'Date of birth',
  gender: 'Gender',
  phone: 'WhatsApp number',
  email: 'Email',
  aadhaar: 'Aadhaar',
  voter_id: 'Voter ID',
  address: 'Address',
  city: 'City / Town / Village',
  district: 'District',
  state: 'State',
  pin_code: 'PIN code',
  country: 'Country',
  current_working_details: 'Current working details',
  is_independent_practitioner: 'Independent practitioner',
  professional_reg_no: 'Registration number',
  membership_category: 'Membership category',
  bo_university: 'B.Optom university',
  bo_college: 'B.Optom college',
  college_address: 'College address',
  bo_completion_date: 'B.Optom completion date',
  highest_qualification: 'Highest qualification',
  documents_file: 'Documents (PDF)',
};

const PATTERN_MSG: Record<string, string> = {
  phone: 'Enter a 10-digit mobile number.',
  aadhaar: 'Aadhaar must be exactly 12 digits.',
  pin_code: 'PIN code must be exactly 6 digits.',
};

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function errorMessage(el: Control) {
  if (el.validity.valueMissing) {
    return el instanceof HTMLInputElement && el.type === 'checkbox'
      ? 'You must accept to continue.'
      : 'This field is required.';
  }
  if (el.validity.typeMismatch) return 'Enter a valid email address.';
  if (el.validity.patternMismatch) return PATTERN_MSG[el.name] ?? 'Invalid format.';
  return el.validationMessage || 'Invalid value.';
}

// Browser-side Supabase client, used ONLY to upload the PDF with a one-time signed URL.
let browserSupabase: SupabaseClient | null = null;
function getBrowserSupabase() {
  browserSupabase ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  return browserSupabase;
}

/* ───────── Small UI helpers ───────── */

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} role="alert" className="text-xs font-normal text-red-600">
      {message}
    </span>
  );
}

function Field({
  name, label, hint, required, error, className = '', children,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid content-start gap-2 text-sm font-semibold ${className}`}>
      <span>
        {label}
        {required && <span className="text-red-500"> *</span>}
        {hint && <span className="ml-1 text-xs font-normal text-slate-500">{hint}</span>}
      </span>
      {children}
      <FieldError id={`${name}-error`} message={error} />
    </label>
  );
}

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <nav aria-label="Application progress" className="mb-8">
      <p className="mb-3 text-sm font-semibold text-slate-600 md:hidden">
        Step {step + 1} of {STEPS.length}: <span className="text-[#073b66]">{STEPS[step].title}</span>
      </p>
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s.title} className={`flex items-center ${i < LAST ? 'flex-1' : ''}`}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onJump(i)}
                aria-current={current ? 'step' : undefined}
                className="group flex items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                    done
                      ? 'border-[#0d9488] bg-[#0d9488] text-white'
                      : current
                        ? 'border-[#0d9488] bg-white text-[#0d9488]'
                        : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span
                  className={`hidden text-sm font-semibold md:inline ${
                    current ? 'text-[#073b66]' : done ? 'text-[#0d9488]' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </button>
              {i < LAST && (
                <span
                  aria-hidden="true"
                  className={`mx-2 h-0.5 flex-1 rounded ${i < step ? 'bg-[#0d9488]' : 'bg-slate-200'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ───────── Success card (payment works exactly like before: PayButton) ───────── */

function SuccessCard({
  applicationNo, email, feeAmount,
}: {
  applicationNo: string;
  email: string;
  feeAmount: number;
}) {
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(applicationNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="grid gap-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0d9488]">
          Application submitted
        </p>
        <h3 className="mt-2 text-2xl font-black text-[#073b66]">Your registration number</h3>
        <p className="mt-4 inline-block rounded-2xl border border-dashed border-[#0d9488] bg-teal-50 px-6 py-4 font-mono text-3xl font-bold tracking-wider text-[#073b66]">
          {applicationNo}
        </p>
        <div className="mt-3">
          <button type="button" onClick={copy} className="text-sm font-semibold text-[#0d9488] hover:underline">
            {copied ? 'Copied ✓' : 'Copy number'}
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Save this number. You will need it together with your email ({email}) to track your application.
        </p>
      </div>

      {paid ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
          Payment proof for {inr(feeAmount)} submitted. Your application is now waiting for admin approval.
        </p>
      ) : (
        <div className="rounded-xl bg-slate-50 px-4 py-5">
          <p className="text-sm text-slate-600">
            Membership fee: <strong>{inr(feeAmount)}</strong>. Your application is reviewed once the fee is paid.
          </p>
          <div className="mt-4 flex justify-center">
            <PayButton applicationNo={applicationNo} email={email} amount={feeAmount} onPaid={() => setPaid(true)} />
          </div>
        </div>
      )}

      <div className="grid gap-2 text-sm">
        <Link href="/membership/signup" className="font-semibold text-[#0d9488] hover:underline">
          Create your member account (to log in later) →
        </Link>
        <Link href="/membership/track" className="font-semibold text-[#0d9488] hover:underline">
          Track your application status →
        </Link>
      </div>
    </div>
  );
}

/* ───────── Main form ───────── */

export default function MembershipForm({ initial }: { initial?: DraftData | null }) {
  const [step, setStep] = useState(initial?.step ?? 0);
  const [applicationNo, setApplicationNo] = useState<string | null>(initial?.applicationNo ?? null);
  const [documentsName, setDocumentsName] = useState<string | null>(initial?.documentsName ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [showResume, setShowResume] = useState(false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<[string, string][]>([]);
  const [done, setDone] = useState<FormState | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const docsRef = useRef<string | null>(initial?.documentsName ?? null);

  const today = new Date().toISOString().split('T')[0];
  const dv = (name: string) => initial?.values[name] ?? '';
  const inv = (n: string) => !!errors[n];
  const desc = (n: string) => (errors[n] ? `${n}-error` : undefined);

  // Resumed on the review step? Build the summary once the fields exist.
  useEffect(() => {
    if (step === LAST) buildSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollToTop() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setDocs(name: string | null) {
    docsRef.current = name;
    setDocumentsName(name);
  }

  /* ---- validation (browser side; the server re-checks everything) ---- */

  function validateStep(i: number) {
    const section = sectionRefs.current[i];
    const form = formRef.current;
    if (!section || !form) return true;

    const found: Record<string, string> = {};
    let firstInvalid: HTMLElement | null = null;

    section.querySelectorAll<Control>('input, select, textarea').forEach((el) => {
      if (!el.name || (el instanceof HTMLInputElement && el.type === 'file') || found[el.name]) return;
      if (!el.checkValidity()) {
        found[el.name] = errorMessage(el);
        firstInvalid ??= el;
      }
    });

    if (i === 3) {
      const input = form.elements.namedItem('documents_file') as HTMLInputElement | null;
      const f = input?.files?.[0];
      if (!f && !docsRef.current) {
        found.documents_file = 'Please upload your documents as a single PDF.';
      } else if (f) {
        if (!/\.pdf$/i.test(f.name) || (f.type && f.type !== 'application/pdf')) {
          found.documents_file = 'Documents must be a single PDF file.';
        } else if (f.size > MAX_DOCS_BYTES) {
          found.documents_file = 'PDF must be 10MB or smaller.';
        }
      }
      if (found.documents_file) firstInvalid ??= input;
    }

    setErrors((prev) => {
      const next = { ...prev };
      STEP_FIELDS[i].forEach((f) => delete next[f]);
      return { ...next, ...found };
    });

    (firstInvalid as HTMLElement | null)?.focus();
    return Object.keys(found).length === 0;
  }

  function buildSummary() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const rows: [string, string][] = [];

    for (const key of Object.keys(LABELS)) {
      if (key === 'documents_file') {
        rows.push([key, docsRef.current ?? '—']);
        continue;
      }
      const v = fd.get(key);
      if (typeof v !== 'string') continue;

      let text = v || '—';
      if (key === 'aadhaar') {
        const last4 = v ? v.slice(-4) : (initial?.aadhaarLast4 ?? '');
        text = last4 ? `XXXX XXXX ${last4}` : '—';
      } else if (key === 'is_independent_practitioner') {
        text = v === 'yes' ? 'Yes' : 'No';
      }
      rows.push([key, text]);
    }
    setSummary(rows);
  }

  /* ---- server calls ---- */

  function applyServerFailure(res: { message?: string; errors?: Record<string, string>; resume?: boolean }) {
    setErrors((prev) => ({ ...prev, ...(res.errors ?? {}) }));
    setMessage(res.message ?? 'Something went wrong. Please try again.');
    setShowResume(!!res.resume);
    const first = Object.keys(res.errors ?? {})
      .map((k) => STEP_OF[k])
      .filter((n) => n !== undefined)
      .sort((a, b) => a - b)[0];
    if (first !== undefined && first !== step) {
      setStep(first);
      scrollToTop();
    }
  }

  async function saveCurrentStep(i: number) {
    const all = new FormData(formRef.current!);
    const fd = new FormData();
    STEP_FIELDS[i].forEach((name) => {
      const v = all.get(name);
      if (typeof v === 'string') fd.set(name, v);
    });
    fd.set('website', String(all.get('website') ?? ''));

    const res = await saveStep(i, fd);
    if (!res.ok) {
      applyServerFailure(res);
      return false;
    }
    if (res.applicationNo) setApplicationNo(res.applicationNo);
    return true;
  }

  async function saveDocs() {
    const input = formRef.current!.elements.namedItem('documents_file') as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return true; // keep the file that was already uploaded

    const up = await createDocumentUpload();
    // FIX: check every field explicitly (works with or without TypeScript "strict")
    if (!up.ok || !up.bucket || !up.path || !up.token) {
      applyServerFailure(up);
      return false;
    }

    const { error } = await getBrowserSupabase()
      .storage.from(up.bucket)
      .uploadToSignedUrl(up.path, up.token, file, { contentType: 'application/pdf' });
    if (error) {
      setMessage('Upload failed. Check your connection and try again.');
      return false;
    }

    const res = await saveDocuments(up.path, file.name);
    if (!res.ok) {
      applyServerFailure(res);
      return false;
    }
    setDocs(file.name);
    input.value = '';
    return true;
  }

  async function goNext() {
    if (busy || !validateStep(step)) return;
    setBusy(true);
    setMessage(null);
    setShowResume(false);
    try {
      const ok = step <= 2 ? await saveCurrentStep(step) : await saveDocs();
      if (ok) {
        const next = step + 1;
        if (next === LAST) buildSummary();
        setStep(next);
        scrollToTop();
      }
    } catch {
      setMessage('Something went wrong. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    setMessage(null);
    setStep((s) => Math.max(0, s - 1));
    scrollToTop();
  }

  function jumpTo(i: number) {
    if (i < step && !busy) {
      setMessage(null);
      setStep(i);
      scrollToTop();
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Enter key on an earlier step = "Next", not submit.
    if (step < LAST) {
      void goNext();
      return;
    }
    if (busy || !validateStep(LAST)) return;

    setBusy(true);
    setMessage(null);
    try {
      // Only send the consent: the PDF is already stored, don't upload it again.
      const fd = new FormData();
      fd.set('declaration_accepted', 'on');
      fd.set('website', (formRef.current!.elements.namedItem('website') as HTMLInputElement).value);

      const res = await finalizeApplication(fd);
      if (res.ok && res.applicationNo) {
        setDone(res);
      } else {
        applyServerFailure(res);
      }
    } catch {
      setMessage('Something went wrong. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done?.ok && done.applicationNo) {
    return (
      <SuccessCard
        applicationNo={done.applicationNo}
        email={done.email ?? ''}
        feeAmount={done.feeAmount ?? 0}
      />
    );
  }

  /* ---- field builders ---- */

  type TxtOpts = {
    hint?: string;
    type?: string;
    required?: boolean;
    span?: boolean;
    placeholder?: string;
    autoComplete?: string;
    inputMode?: 'text' | 'tel' | 'email' | 'numeric';
    maxLength?: number;
    pattern?: string;
    max?: string;
    defaultValue?: string;
  };

  const txt = (name: string, label: string, o: TxtOpts = {}) => (
    <Field
      name={name}
      label={label}
      hint={o.hint}
      required={o.required ?? true}
      error={errors[name]}
      className={o.span ? 'md:col-span-2' : ''}
    >
      <input
        name={name}
        type={o.type ?? 'text'}
        inputMode={o.inputMode}
        autoComplete={o.autoComplete}
        placeholder={o.placeholder ?? label}
        required={o.required ?? true}
        maxLength={o.maxLength}
        pattern={o.pattern}
        max={o.max}
        defaultValue={o.defaultValue ?? dv(name)}
        aria-invalid={inv(name)}
        aria-describedby={desc(name)}
        className={inputCls}
      />
    </Field>
  );

  const sel = (name: string, label: string, options: readonly string[], render?: (o: string) => string) => (
    <Field name={name} label={label} required error={errors[name]}>
      <select name={name} required defaultValue={dv(name)} aria-invalid={inv(name)} className={inputCls}>
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {render ? render(o) : o}
          </option>
        ))}
      </select>
    </Field>
  );

  const section = (i: number) => `gap-5 md:grid-cols-2 ${step === i ? 'grid' : 'hidden'}`;
  const chosenCategory = summary.find(([k]) => k === 'membership_category')?.[1];
  const fee =
    chosenCategory && chosenCategory in FEES ? FEES[chosenCategory as keyof typeof FEES] : undefined;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="scroll-mt-24">
      {/* Honeypot: hidden from people, visible to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {applicationNo && (
        <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-slate-700">
          <p>
            Registration no.: <strong className="font-mono text-[#073b66]">{applicationNo}</strong>
          </p>
          <p className="mt-1">
            Your progress is saved after every step. You can leave and come back any time — choose{' '}
            <strong>Continue application</strong> and enter your email and date of birth.
          </p>
          <button
            type="button"
            onClick={() => void exitApplication()}
            className="mt-2 font-semibold text-[#0d9488] hover:underline"
          >
            Exit (saved steps are kept)
          </button>
        </div>
      )}

      <Stepper step={step} onJump={jumpTo} />

      <h3 className="mb-5 text-xl font-black text-[#073b66]">{STEPS[step].heading}</h3>

      {/* All steps stay mounted (just hidden) so typed values persist between steps. */}

      {/* ───────── Step 1: Personal ───────── */}
      <div ref={(el) => { sectionRefs.current[0] = el; }} className={section(0)}>
        {txt('full_name', 'Full Name', { hint: 'as per official records', autoComplete: 'name' })}
        {txt('date_of_birth', 'Date of Birth', { type: 'date', autoComplete: 'bday', max: today })}
        {sel('gender', 'Gender', GENDERS)}
        {txt('phone', 'WhatsApp Number', {
          type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 10,
          pattern: '[0-9]{10}', placeholder: '10-digit WhatsApp number',
        })}
        {txt('email', 'Email Address', { type: 'email', inputMode: 'email', autoComplete: 'email', span: true })}
        <p className="text-xs text-slate-500 md:col-span-2">
          Your email and date of birth are what you will use to continue this application later.
        </p>
      </div>

      {/* ───────── Step 2: Identity, address & work ───────── */}
      <div ref={(el) => { sectionRefs.current[1] = el; }} className={section(1)}>
        <Field name="aadhaar" label="Aadhaar Number" required={!initial?.aadhaarLast4} error={errors.aadhaar}>
          <input
            name="aadhaar" inputMode="numeric" maxLength={12} pattern="[0-9]{12}" autoComplete="off"
            required={!initial?.aadhaarLast4}
            placeholder={
              initial?.aadhaarLast4
                ? `Saved (XXXX XXXX ${initial.aadhaarLast4}) — leave blank to keep`
                : '12-digit Aadhaar number'
            }
            aria-invalid={inv('aadhaar')} aria-describedby={desc('aadhaar')} className={inputCls}
          />
        </Field>
        {txt('voter_id', 'Voter ID Number', { hint: 'permanent residency is mandatory', autoComplete: 'off' })}

        <Field name="address" label="Address / House No." required error={errors.address} className="md:col-span-2">
          <textarea
            name="address" required rows={2} autoComplete="address-line1" placeholder="Address / House No."
            defaultValue={dv('address')} aria-invalid={inv('address')} aria-describedby={desc('address')}
            className={`${inputCls} min-h-20`}
          />
        </Field>

        {txt('city', 'City / Town / Village', { autoComplete: 'address-level2' })}
        {sel('district', 'District', DISTRICTS)}
        {txt('state', 'State', { autoComplete: 'address-level1' })}
        {txt('pin_code', 'PIN Code', {
          inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 6, pattern: '[0-9]{6}',
          placeholder: '6-digit PIN code',
        })}
        {txt('country', 'Country', { autoComplete: 'country-name', defaultValue: dv('country') || 'India' })}
        {txt('current_working_details', 'Current Working Details', {
          hint: 'designation & job field', placeholder: 'e.g. Optometrist, Eye Hospital',
        })}

        <fieldset className="grid content-start gap-2 text-sm font-semibold md:col-span-2">
          <legend className="mb-2">
            Are you an independent optometry practitioner? <span className="text-red-500">*</span>
          </legend>
          <label className="flex items-center gap-2 font-normal text-slate-700">
            <input
              type="radio" name="is_independent_practitioner" value="yes" required
              defaultChecked={dv('is_independent_practitioner') === 'yes'}
              className="h-4 w-4 accent-[#0d9488]"
            />
            Yes, I am an independent practitioner
          </label>
          <label className="flex items-center gap-2 font-normal text-slate-700">
            <input
              type="radio" name="is_independent_practitioner" value="no"
              defaultChecked={dv('is_independent_practitioner') === 'no'}
              className="h-4 w-4 accent-[#0d9488]"
            />
            No, I don&apos;t practice independently
          </label>
          <FieldError id="is_independent_practitioner-error" message={errors.is_independent_practitioner} />
        </fieldset>

        {txt('professional_reg_no', 'Professional Registration Number', {
          hint: '(if any)', required: false, placeholder: 'Registration Number',
        })}
        {sel('membership_category', 'Membership Category', CATEGORIES, (c) => `${c} — ${inr(FEES[c as keyof typeof FEES])}`)}
      </div>

      {/* ───────── Step 3: Education ───────── */}
      <div ref={(el) => { sectionRefs.current[2] = el; }} className={section(2)}>
        {txt('bo_university', 'B.Optom University Name', { placeholder: 'University Name' })}
        {txt('bo_college', 'B.Optom College Name', { placeholder: 'College Name' })}

        <Field name="college_address" label="College Address" required error={errors.college_address} className="md:col-span-2">
          <textarea
            name="college_address" required rows={2} placeholder="College Address"
            defaultValue={dv('college_address')} aria-invalid={inv('college_address')}
            aria-describedby={desc('college_address')} className={`${inputCls} min-h-20`}
          />
        </Field>

        {txt('bo_completion_date', 'B.Optom Completion Date', {
          type: 'date', max: today, hint: 'internship / final year end date, as per certificates',
        })}
        {sel('highest_qualification', 'Current Highest Qualification', HIGHEST_QUALIFICATIONS)}
      </div>

      {/* ───────── Step 4: Documents ───────── */}
      <div ref={(el) => { sectionRefs.current[3] = el; }} className={section(3)}>
        <Field
          name="documents_file" label="Upload All Documents" required={!documentsName}
          error={errors.documents_file} className="md:col-span-2"
        >
          <span className="text-xs font-normal text-slate-500">
            Passport photo, Aadhaar, birth certificate, Voter ID, HS Science marksheet, all B.Optom
            marksheets, internship completion certificate and B.Optom degree certificate — merged into
            a single PDF, up to 10MB.
          </span>
          {documentsName && (
            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-normal text-emerald-800">
              Uploaded: <strong>{documentsName}</strong>. Choose a new file only if you want to replace it.
            </span>
          )}
          <input
            name="documents_file" type="file" accept="application/pdf,.pdf"
            aria-invalid={inv('documents_file')} aria-describedby={desc('documents_file')} className={fileCls}
          />
        </Field>
        <p className="text-sm text-slate-600 md:col-span-2">
          Payment is done <strong>after</strong> you submit — you will see the QR / bank details and can
          upload your payment proof then.
        </p>
      </div>

      {/* ───────── Step 5: Review & consent ───────── */}
      <div ref={(el) => { sectionRefs.current[4] = el; }} className={`gap-6 ${step === 4 ? 'grid' : 'hidden'}`}>
        <p className="text-sm text-slate-600">
          Please check your details. Use <strong>Edit</strong> to go back and change anything.
        </p>

        {STEP_FIELDS.slice(0, LAST).map((fields, i) => {
          const rows = summary.filter(([k]) => (fields as readonly string[]).includes(k));
          return (
            <section key={STEPS[i].title} className="rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h4 className="font-black text-[#073b66]">{STEPS[i].heading}</h4>
                <button type="button" onClick={() => jumpTo(i)} className="text-sm font-semibold text-[#0d9488] hover:underline">
                  Edit
                </button>
              </div>
              <dl className="grid gap-x-6 gap-y-3 p-4 text-sm sm:grid-cols-2">
                {rows.map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{LABELS[k]}</dt>
                    <dd className="break-words text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}

        {fee ? (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Membership fee: <strong>{inr(fee)}</strong> — payable after you submit (QR / bank transfer, then upload the proof).
          </p>
        ) : null}

        <div className="grid gap-2">
          <label className="flex items-start gap-3 text-sm font-normal text-slate-700">
            <input
              type="checkbox" name="declaration_accepted" required aria-invalid={inv('declaration_accepted')}
              className="mt-1 h-4 w-4 accent-[#0d9488]"
            />
            <span>
              I confirm that I am applying for Lifetime Membership of the association. I understand
              that the membership fee is non-refundable and that my registration will be subject to
              document verification and approval by the association.
            </span>
          </label>
          <FieldError id="declaration_accepted-error" message={errors.declaration_accepted} />
        </div>
      </div>

      {message && (
        <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}{' '}
          {showResume && (
            <Link href="/membership/apply/resume" className="font-semibold underline">
              Continue your application →
            </Link>
          )}
        </p>
      )}

      {/* ───────── Navigation ───────── */}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || busy}
          className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:invisible"
        >
          ← Back
        </button>

        {step < LAST ? (
          <button
            type="button"
            onClick={() => void goNext()}
            disabled={busy}
            className="rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (step === 3 ? 'Uploading…' : 'Saving…') : 'Save & continue →'}
          </button>
        ) : (
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Submitting…' : 'Submit Application'}
          </button>
        )}
      </div>
    </form>
  );
}