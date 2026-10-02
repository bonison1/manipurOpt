// Path: app/admin/hero/page.tsx
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getHeroContent } from '@/lib/hero';
import HeroEditor from '@/components/admin/HeroEditor';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';
import AdminNav from '../AdminNav';
import { removeHeroImage, saveHero } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminHero({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireAdmin();
  const { error, ok } = await searchParams;
  const { image, settings } = await getHeroContent();

  return (
    <div className="container py-12">
      <AdminNav email={user.email} />
      <h1 className="text-3xl font-black text-[#073b66]">Homepage hero</h1>
      <p className="mt-2 text-slate-500">
        The large section at the top of the homepage: background photo, heading, tagline and two buttons.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      <Card>
        <HeroEditor action={saveHero} initial={settings} imageUrl={image?.url ?? null} />
      </Card>

      {image && (
        <form action={removeHeroImage} className="mt-4">
          <PendingOverlay text="Removing..." />
          <SubmitButton pendingText="Removing..." className="text-sm font-semibold text-red-600 hover:underline">
            Remove the custom photo (use the default)
          </SubmitButton>
        </form>
      )}
    </div>
  );
}