import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/GalleryGrid';
import { PageHero } from '@/components/PageHero';
import { getGalleryImages } from '@/lib/gallery';

export const metadata: Metadata = {
  title: 'Gallery | Manipur Optometrist Association',
  description: 'Photos from MOA events, CME programs and community outreach.',
};

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <>
      <PageHero title="Gallery" subtitle="Moments from our events, CME programs and community outreach." />

      <section className="wrap py-14 md:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b7bb8]">Our journey</p>
          <h2 className="mt-3 text-2xl font-black text-[#073b66] md:text-4xl">
            Caring for Manipur&apos;s eyes, together
          </h2>
          <p className="mt-4 text-slate-600">
            From continuing education programs and scientific meetings to free eye-care camps in
            communities across the state, these snapshots capture the people and moments behind the
            Manipur Optometrist Association. Tap any photo to view it larger.
          </p>
          {images.length > 0 && (
            <p className="mt-4 inline-block rounded-full bg-[#073b66]/5 px-4 py-1 text-sm font-semibold text-[#073b66]">
              {images.length} photo{images.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <GalleryGrid images={images} />

        <p className="mt-12 text-center text-sm text-slate-500">
          Have photos from an MOA event? Reach out to us and we&apos;ll feature them here.
        </p>
      </section>
    </>
  );
}