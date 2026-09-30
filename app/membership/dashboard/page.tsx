// Path: app/membership/dashboard/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/Page';
import { Card } from '@/components/ui';
import StatusBadge from '@/components/StatusBadge';
import { createSupabaseServer } from '@/lib/auth/supabase-server';
import { createServiceClient } from '@/lib/supabase/server';
import { formatDate, inr } from '@/lib/format';
import { memberLogout } from '../auth-actions';
import PayButton from '../PayButton';
import MemberCard from './MemberCard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Member Dashboard | MOA' };

type Member = {
  application_no: string;
  full_name: string;
  email: string;
  phone: string;
  district: string;
  membership_category: string;
  qualification: string;
  institution: string;
  professional_reg_no: string | null;
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'unpaid' | 'paid';
  fee_amount: number;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  certificate_no: string | null;
  is_draft: boolean;
  draft_step: number | null;
};

const COLUMNS =
  'application_no, full_name, email, phone, district, membership_category, qualification, institution, professional_reg_no, status, payment_status, fee_amount, created_at, reviewed_at, admin_notes, certificate_no, is_draft, draft_step';

const dateOnly = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      })
    : '—';

function headline(m: Member) {
  if (m.status === 'approved') return 'Your membership is approved. Welcome to MOA!';
  if (m.status === 'rejected') return 'Your application was not approved.';
  if (m.payment_status === 'unpaid') return 'Complete your payment so the review can begin.';
  return 'Payment received. Your application is waiting for admin review.';
}

function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero title={title} subtitle={subtitle} />
      <div className="container py-12">{children}</div>
    </>
  );
}

function SignOut() {
  return (
    <form action={memberLogout}>
      <button
        type="submit"
        className="rounded-lg border px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Sign out
      </button>
    </form>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export default async function MemberDashboard() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect('/membership/login');

  if (!user.email_confirmed_at) {
    return (
      <Shell title="Member dashboard">
        <Card>
          <p className="text-slate-700">
            Please confirm your email address ({user.email}) using the link we sent you, then come back here.
          </p>
          <div className="mt-4">
            <SignOut />
          </div>
        </Card>
      </Shell>
    );
  }

  const { data, error } = await createServiceClient()
    .from('membership_applications')
    .select(COLUMNS)
    .eq('email', user.email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('dashboard load failed:', error);
    return (
      <Shell title="Member dashboard">
        <Card>
          <p className="text-slate-700">We could not load your membership right now. Please try again shortly.</p>
          <div className="mt-4">
            <SignOut />
          </div>
        </Card>
      </Shell>
    );
  }

  const m = data as Member | null;

  if (!m) {
    return (
      <Shell title="Member dashboard" subtitle={`Signed in as ${user.email}`}>
        <Card>
          <p className="text-slate-700">We could not find a membership application for this email address.</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link href="/membership/apply" className="font-semibold text-[#0d9488] hover:underline">
              Apply for membership →
            </Link>
            <SignOut />
          </div>
        </Card>
      </Shell>
    );
  }

  // Unfinished application: send them back into the form (they are already signed in)
  if (m.is_draft) {
    return (
      <Shell title="Member dashboard" subtitle={`Welcome, ${m.full_name}`}>
        <Card>
          <p className="font-mono text-lg font-bold text-[#073b66]">{m.application_no}</p>
          <p className="mt-3 font-semibold text-[#073b66]">Your application is not finished yet.</p>
          <p className="mt-1 text-sm text-slate-600">
            Your saved answers are waiting. Continue from where you stopped and submit to start the review.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/membership/apply"
              className="inline-flex items-center justify-center rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73]"
            >
              Continue application
            </Link>
            <SignOut />
          </div>
        </Card>
      </Shell>
    );
  }

  const approved = m.status === 'approved';
  const memberSince = dateOnly(m.reviewed_at);

  const steps = [
    { label: 'Application submitted', done: true, detail: formatDate(m.created_at) },
    {
      label: 'Fee paid',
      done: m.payment_status === 'paid',
      detail: m.payment_status === 'paid' ? inr(m.fee_amount) : `${inr(m.fee_amount)} due`,
    },
    {
      label: 'Admin review',
      done: m.status !== 'pending',
      detail: m.status === 'pending' ? 'Waiting' : formatDate(m.reviewed_at),
    },
  ];

  return (
    <Shell title="Member dashboard" subtitle={`Welcome, ${m.full_name}`}>
      <div className="grid gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-500">{user.email}</span>
          <SignOut />
        </div>

        {/* Status */}
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-lg font-bold text-[#073b66]">{m.application_no}</p>
              <p className="text-sm text-slate-600">
                {m.full_name} · {m.membership_category}
              </p>
            </div>
            <div className="flex gap-2">
              <StatusBadge value={m.payment_status} />
              <StatusBadge value={m.status} label={m.status === 'pending' ? 'Under review' : undefined} />
            </div>
          </div>

          <p className="mt-5 font-semibold text-[#073b66]">{headline(m)}</p>

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

          {m.admin_notes && (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">Note from MOA</p>
              <p className="mt-1 whitespace-pre-wrap">{m.admin_notes}</p>
            </div>
          )}

          {m.payment_status === 'unpaid' && m.status !== 'rejected' && (
            <div className="mt-5">
              <PayButton applicationNo={m.application_no} email={m.email} amount={m.fee_amount} />
            </div>
          )}
        </Card>

        {/* Certificate + card (approved members only) */}
        {approved && (
          <>
            <Card>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0d9488]">Membership certificate</p>
              <p className="mt-3 font-mono text-3xl font-bold tracking-wider text-[#073b66]">
                {m.certificate_no ?? 'Being generated…'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Approved on {memberSince} · {m.membership_category}
              </p>
            </Card>

            {m.certificate_no && (
              <Card>
                <h2 className="mb-5 text-xl font-black text-[#073b66]">Your member card</h2>
                <MemberCard
                  name={m.full_name}
                  category={m.membership_category}
                  certificateNo={m.certificate_no}
                  district={m.district}
                  memberSince={memberSince}
                />
              </Card>
            )}
          </>
        )}

        {/* Profile */}
        <Card>
          <h2 className="mb-5 text-xl font-black text-[#073b66]">Your details</h2>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Full name" value={m.full_name} />
            <Detail label="Email" value={m.email} />
            <Detail label="Phone" value={m.phone} />
            <Detail label="District" value={m.district} />
            <Detail label="Qualification" value={m.qualification} />
            <Detail label="Institution" value={m.institution} />
            {m.professional_reg_no && <Detail label="Professional reg. no." value={m.professional_reg_no} />}
            <Detail label="Applied on" value={dateOnly(m.created_at)} />
          </dl>
        </Card>
      </div>
    </Shell>
  );
}