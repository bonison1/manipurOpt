// Path: app/membership/dashboard/RegistrationSection.tsx
import { Panel as Card } from '@/components/form-ui';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, inr } from '@/lib/format';
import { REGISTRATIONS, isRegType } from '@/app/register/config';
import PayButton from '../PayButton';
import { getProofStatus, type ProofStatus } from '../payment-actions';
import MemberCard from './MemberCard';
import RegistrationCertificate from './RegistrationCertificate';

/** Row from `registrations` (select('*')). Optional columns may be absent. */
export type RegistrationRow = {
  reference_no: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  fee_amount: number | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  payment_status: 'unpaid' | 'paid' | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  certificate_no: string | null;
  affiliation_no: string | null;
  registration_no: string | null;
  institution_name: string | null;
  university_name: string | null;
  admission_year: number | null;
};

const dateOnly = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      })
    : '—';

function headline(r: RegistrationRow, status: string, pay: string, proofSubmitted: boolean) {
  if (status === 'approved') return 'Your registration is approved. Welcome to MOA!';
  if (status === 'rejected') return 'Your registration was not approved.';
  if (pay === 'unpaid' && proofSubmitted) return 'Payment proof received. We will verify it shortly.';
  if (pay === 'unpaid') return 'Complete your payment so the review can begin.';
  return 'Payment received. Your registration is waiting for admin review.';
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export default async function RegistrationSection({ r }: { r: RegistrationRow }) {
  if (!isRegType(r.type)) return null;
  const cfg = REGISTRATIONS[r.type];

  const status = r.status ?? 'pending';
  const pay = r.payment_status ?? 'unpaid';
  const fee = r.fee_amount ?? cfg.fee;
  const approved = status === 'approved';

  // A submitted payment proof counts as "fee paid" (pending verification) or once approved
  const proof = await getProofStatus(r.reference_no, r.email).catch(() => ({ status: 'none' }) as ProofStatus);
  const proofSubmitted = proof.status === 'pending' || proof.status === 'approved';
  const issued = dateOnly(r.reviewed_at ?? r.created_at);

  const steps = [
    { label: 'Registration submitted', done: true, detail: formatDate(r.created_at) },
    {
      label: 'Fee paid',
      done: pay === 'paid' || proofSubmitted,
      detail:
        pay === 'paid'
          ? inr(fee)
          : proofSubmitted
            ? `${inr(fee)} · proof submitted, awaiting verification`
            : `${inr(fee)} due`,
    },
    {
      label: 'Admin review',
      done: status !== 'pending',
      detail: status === 'pending' ? 'Waiting' : formatDate(r.reviewed_at),
    },
  ];

  const details: [string, string | null][] = [
    ['Name', r.name],
    ['Email', r.email],
    ['Phone', r.phone],
    ['Address', r.address],
    ['Affiliation no.', r.affiliation_no],
    ['Registration no.', r.registration_no],
    ['Institution', r.institution_name],
    ['University', r.university_name],
    ['Batch (B.Optom admission)', r.admission_year ? String(r.admission_year) : null],
    ['Registered on', dateOnly(r.created_at)],
  ];

  return (
    <div className="grid gap-8">
      {/* Status */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-lg font-bold text-[#073b66]">{r.reference_no}</p>
            <p className="text-sm text-slate-600">
              {r.name} · {cfg.title}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge value={pay} label={pay === 'unpaid' && proofSubmitted ? 'Verifying' : undefined} />
            <StatusBadge value={status} label={status === 'pending' ? 'Under review' : undefined} />
          </div>
        </div>

        <p className="mt-5 font-semibold text-[#073b66]">{headline(r, status, pay, proofSubmitted)}</p>

        {!approved && (
          <ol className="mt-5 grid gap-3">
            {steps.map((s) => (
              <li key={s.label} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    s.done ? 'bg-[#0d9488] text-white' : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {s.done ? '✓' : ''}
                </span>
                <span>
                  <span className="font-semibold text-slate-800">{s.label}</span>
                  <span className="block text-slate-500">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        {r.admin_notes && (
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold">Note from MOA</p>
            <p className="mt-1 whitespace-pre-wrap">{r.admin_notes}</p>
          </div>
        )}

        {pay === 'unpaid' && status !== 'rejected' && (
          <div className="mt-5">
            <PayButton applicationNo={r.reference_no} email={r.email} amount={fee} />
          </div>
        )}
      </Card>

      {/* Certificate (institute / clinic) or card (student) */}
      {approved && r.type !== 'student' && (
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0d9488]">Registration certificate</p>
          {r.certificate_no ? (
            <div className="mt-5">
              <RegistrationCertificate
                name={r.name}
                kindLabel={r.type === 'institute' ? 'Institute' : 'Eye care clinic'}
                address={r.address}
                detailLabel={r.type === 'institute' ? 'Affiliation no.' : 'Registration no.'}
                detailValue={(r.type === 'institute' ? r.affiliation_no : r.registration_no) ?? '—'}
                certificateNo={r.certificate_no}
                issuedOn={issued}
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Your certificate is being generated…</p>
          )}
        </Card>
      )}

      {approved && r.type === 'student' && (
        <Card>
          <h2 className="mb-5 text-xl font-black text-[#073b66]">Your student card</h2>
          {r.certificate_no ? (
            <MemberCard
              name={r.name}
              category="B.Optom Student"
              certificateNo={r.certificate_no}
              detailLabel="BATCH"
              district={r.admission_year ? String(r.admission_year) : '—'}
              memberSince={issued}
            />
          ) : (
            <p className="text-sm text-slate-600">Your card is being generated…</p>
          )}
        </Card>
      )}

      {!approved && status !== 'rejected' && (
        <Card>
          <h2 className="text-xl font-black text-[#073b66]">
            {r.type === 'student' ? 'Your student card' : 'Your certificate'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            It will appear here once MOA verifies and approves your registration.
          </p>
        </Card>
      )}

      {/* Details */}
      <Card>
        <h2 className="mb-5 text-xl font-black text-[#073b66]">Registration details</h2>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {details
            .filter(([, v]) => !!v)
            .map(([label, value]) => (
              <Detail key={label} label={label} value={value as string} />
            ))}
        </dl>
      </Card>
    </div>
  );
}