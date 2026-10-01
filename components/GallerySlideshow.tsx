// Path: components/GallerySlideshow.tsx
'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { GalleryImage } from '@/lib/gallery';

export default function GallerySlideshow({
  images,
  interval = 4500,
}: {
  images: GalleryImage[];
  interval?: number;
}) {
  const n = images.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((d: number) => setI((c) => (c + d + n) % n), [n]);

  // Auto-advance (restarts after any manual change; off for reduced-motion users)
  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => go(1), interval);
    return () => clearInterval(t);
  }, [n, paused, go, interval, i]);

  if (n === 0) return null;

  const arrow =
    'absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-2xl text-white opacity-0 transition hover:bg-black/55 focus:opacity-100 group-hover:opacity-100 max-md:opacity-100';

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-tint sm:aspect-[16/9] lg:aspect-[21/9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery highlights"
    >
      {images.map((img, idx) => (
        <div
          key={img.src}
          aria-hidden={idx !== i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === i ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={idx === 0}
            sizes="(min-width: 1280px) 1200px, 100vw"
            className={`object-cover transition-transform duration-[6000ms] ease-out ${
              idx === i ? 'scale-100' : 'scale-110'
            }`}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-10 pt-16 text-white">
        <p className="text-sm font-medium md:text-base">{images[i].alt}</p>
      </div>

      {n > 1 && (
        <>
          <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className={`${arrow} left-3`}>
            ‹
          </button>
          <button type="button" aria-label="Next photo" onClick={() => go(1)} className={`${arrow} right-3`}>
            ›
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
            {images.map((img, idx) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Go to photo ${idx + 1}`}
                aria-current={idx === i}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}