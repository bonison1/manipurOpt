// Path: components/GalleryGrid.tsx
'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { GalleryImage } from '@/lib/gallery';

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [current, setCurrent] = useState<number | null>(null);

  const close = useCallback(() => setCurrent(null), []);
  const step = useCallback(
    (d: number) => setCurrent((c) => (c === null ? c : (c + d + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (current === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [current, close, step]);

  if (images.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center text-muted">
        Photos will appear here soon.
      </div>
    );
  }

  const active = current === null ? null : images[current];
  const btn =
    'absolute grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/30';

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`View photo: ${img.alt}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-tint"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="on-dark fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.src}
            alt={active.alt}
            className="max-h-[82vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-5 left-0 right-0 px-16 text-center text-sm text-white/80">
            {active.alt} · {current! + 1} / {images.length}
          </p>

          <button type="button" aria-label="Close" onClick={close} className={`${btn} right-4 top-4`}>
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className={`${btn} left-3 top-1/2 -translate-y-1/2`}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className={`${btn} right-3 top-1/2 -translate-y-1/2`}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default GalleryGrid;