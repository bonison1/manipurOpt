'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { GalleryImage } from '@/lib/gallery';
import { TILE_SPAN, tileFor, type Tile } from '@/lib/gallery-layout';

const SIZES: Record<Tile, string> = {
  feature: '(min-width: 768px) 50vw, 100vw',
  wide: '(min-width: 768px) 50vw, 100vw',
  tall: '(min-width: 768px) 25vw, 50vw',
  std: '(min-width: 768px) 25vw, 50vw',
};

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
      <ul className="grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] md:auto-rows-[210px] md:grid-cols-4 md:gap-4">
        {images.map((img, i) => {
          const tile = tileFor(i);
          return (
            <li key={`${img.src}-${i}`} className={TILE_SPAN[tile]}>
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={img.caption ? `View photo: ${img.caption}` : 'View photo'}
                className="group relative block h-full w-full overflow-hidden rounded-2xl border border-line bg-tint text-left shadow-sm transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#073b66]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i < 2}
                  sizes={SIZES[tile]}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                {img.caption && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#031d33]/80 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
                    <p
                      className={`absolute inset-x-0 bottom-0 p-3 font-semibold leading-snug text-white md:p-4 ${
                        tile === 'feature' ? 'text-base md:text-xl' : 'line-clamp-2 text-xs md:text-sm'
                      }`}
                    >
                      {img.caption}
                    </p>
                  </>
                )}

                {tile === 'feature' && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#073b66]">
                    Featured moment
                  </span>
                )}
              </button>
            </li>
          );
        })}
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
            {active.caption && <>{active.caption} · </>}
            {current! + 1} / {images.length}
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