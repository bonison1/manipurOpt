
import { adminLogin } from '../actions';

export const metadata = { title: 'Admin sign in | MOA' };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-[#073b66]">Membership admin</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to review applications.</p>

        <form action={adminLogin} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#0d9488]"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Invalid email or password, or this account is not an admin.
            </p>
          )}

          <button
            type="submit"
            className="rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition hover:bg-[#0b7d73]"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}