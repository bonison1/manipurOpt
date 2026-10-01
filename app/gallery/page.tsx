// Path: app/gallery/page.tsx
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
        <GalleryGrid images={images} />
      </section>
    </>
  );
}