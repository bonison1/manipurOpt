// Path: components/GalleryBanner.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import Cta from '@/components/Cta';
import { useEffect, useState } from 'react';

export type BannerPhoto = { src: string; alt: string };

type Props = {
  photos: BannerPhoto[];
  title?: string;
  linkLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

// Time each photo stays on screen before the next one fades in (ms)
const INTERVAL = 4500;

export default function GalleryBanner({
  photos,
  title = 'Moments from MOA',
  linkLabel = 'View full gallery',
  ctaLabel = 'Become a member',
  ctaHref = '/membership',
}: Props) {
  const [active, setActive] = useState(0);

  // Restarts whenever `active` changes, so clicking a dot resets the timer
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % photos.length), INTERVAL);
    return () => clearTimeout(t);
  }, [active, photos.length]);

  // If slides are removed in the admin while the page is open, keep the index valid
  useEffect(() => {
    if (active >= photos.length) setActive(0);
  }, [active, photos.length]);

  if (photos.length === 0) return null;

  return (
    <section className="wrap pb-16 md:pb-20">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-tint sm:aspect-[16/8] md:aspect-[16/6]">
        {/* All photos are stacked; only the active one is opaque, so each one fades out as the next fades in */}
        {photos.map((p, i) => (
          <Image
            key={`${p.src}-${i}`}
            src={p.src}
            alt={p.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1280px) 1200px, 100vw"
            className={`object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Bottom gradient so the text stays readable on any photo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white md:p-8">
          <div>
            {title && <h2 className="font-display text-xl font-bold md:text-3xl">{title}</h2>}

            {linkLabel && (
              <Link
                href="/gallery"
                className="mt-1 inline-block text-sm font-semibold underline-offset-4 hover:underline"
              >
                {linkLabel}
              </Link>
            )}

            {ctaLabel && ctaHref && (
              <div className="mt-6 flex justify-center md:justify-start [&>a]:w-full sm:[&>a]:w-auto">
                <Cta href={ctaHref} variant="mint">
                  {ctaLabel}
                </Cta>
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 pb-1">
              {photos.map((p, i) => (
                <button
                  key={`${p.src}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === active ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}