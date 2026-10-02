// Path: app/admin/page.tsx
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FolderKanban,
  Image as ImageIcon,
  Images,
  Mail,
  MessageSquareQuote,
  Newspaper,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/auth/admin-client';
import { APPLICATIONS_TABLE as T } from '@/lib/auth/config';
import AdminNav from './AdminNav';

export const dynamic = 'force-dynamic';

type Section = { label: string; href?: string; note: string; icon: LucideIcon };
type Group = { title: string; items: Section[] };

const groups: Group[] = [
  {
    title: 'People',
    items: [
      { label: 'Leadership', href: '/admin/leadership', note: 'Add leaders with name, position and photo.', icon: Users },
      { label: 'Leader messages', href: '/admin/leader-messages', note: 'Add or edit messages from the President and other office bearers.', icon: MessageSquareQuote },
      { label: 'Admins', href: '/admin/admins', note: 'Add or remove people who can access this panel.', icon: ShieldCheck },
    ],
  },
  {
    title: 'Website content',
    items: [
      { label: 'Gallery', href: '/admin/gallery', note: 'Upload and remove gallery photos.', icon: Images },
      { label: 'Hero image', href: '/admin/hero', note: 'Change the large background photo at the top of the homepage.', icon: ImageIcon },
      // { label: 'Homepage banner', href: '/admin/banner', note: 'Choose the slideshow photos and the text on the homepage banner.', icon: ImageIcon },
      { label: 'Events', href: '/admin/events', note: 'Add, edit or delete events, with an optional photo.', icon: CalendarDays },
      { label: 'News', href: '/admin/news', note: 'Write, edit or delete news and announcements.', icon: Newspaper },
    ],
  },
];

const comingSoon: Section[] = [
  { label: 'Members', note: 'Member directory and profiles.', icon: UserRound },
  { label: 'Projects', note: 'Association projects and initiatives.', icon: FolderKanban },
  { label: 'Resources', note: 'Documents and learning material.', icon: BookOpen },
  { label: 'Messages', note: 'Contact form and inbox.', icon: Mail },
];

export default async function Admin() {
  const user = await requireAdmin();
  const sb = createAdminClient();

  const [proofs, review, approved, total] = await Promise.all([
    sb.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from(T).select('id', { count: 'exact', head: true }).eq('payment_status', 'paid').eq('status', 'pending'),
    sb.from(T).select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    sb.from(T).select('id', { count: 'exact', head: true }),
  ]);

  const stats = [
    { n: proofs.count ?? 0, label: 'Payments to verify', href: '/admin/application?filter=proofs', icon: CreditCard, attention: true },
    { n: review.count ?? 0, label: 'Ready for approval', href: '/admin/application?filter=review', icon: ClipboardCheck, attention: true },
    { n: approved.count ?? 0, label: 'Approved members', href: '/admin/application?filter=approved', icon: UserCheck, attention: false },
    { n: total.count ?? 0, label: 'Total applications', href: '/admin/application?filter=all', icon: Users, attention: false },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <AdminNav email={user.email} />

      <header>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-tight text-[#073b66] sm:text-4xl">
          MOA Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-500">Verify payments and review membership applications.</p>
      </header>

      {/* Stats */}
      <section aria-label="Application overview" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const needsAction = s.attention && s.n > 0;
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`group relative rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] ${
                needsAction ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    needsAction ? 'bg-amber-100 text-amber-700' : 'bg-[#0d9488]/10 text-[#0d9488]'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-slate-300 transition group-hover:text-[#0d9488]"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-4 text-3xl font-black text-[#073b66]">{s.n}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
              {needsAction && (
                <span className="absolute right-4 top-4 hidden h-2 w-2 rounded-full bg-amber-500 sm:block" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </section>

      {/* Manage groups */}
      {groups.map((g) => (
        <section key={g.title} className="mt-10">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">{g.title}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {g.items.map((x) => {
              const Icon = x.icon;
              return (
                <Link
                  key={x.label}
                  href={x.href!}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0d9488]/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#073b66]/5 text-[#073b66] transition group-hover:bg-[#0d9488]/10 group-hover:text-[#0d9488]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#073b66]">{x.label}</span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 -translate-x-1 text-slate-300 opacity-0 transition group-hover:translate-x-0 group-hover:text-[#0d9488] group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-500">{x.note}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {/* Coming soon */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Coming soon</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoon.map((x) => {
            const Icon = x.icon;
            return (
              <div
                key={x.label}
                aria-disabled="true"
                className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-500">{x.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{x.note}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}