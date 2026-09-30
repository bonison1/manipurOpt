// Path: components/ScrollEye.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const BASE = 400; // design size of the eye, scaled with CSS transform
const DOCK = 104; // size of the small eye docked in the corner

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

type Mode = 'pending' | 'inline' | 'scroll';

function EyeArt({ labelsRef }: { labelsRef?: React.Ref<HTMLDivElement> }) {
  return (
    <>
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="moa-iris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'var(--color-mint)' }} />
            <stop offset="45%" style={{ stopColor: 'var(--color-brand)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-brand-dark)' }} />
          </radialGradient>
          <radialGradient id="moa-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#ffffff' }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-tint)' }} />
          </radialGradient>
          <clipPath id="moa-eye-clip">
            <path d="M36 200 Q200 62 364 200 Q200 338 36 200 Z" />
          </clipPath>
        </defs>

        <circle cx="200" cy="200" r="190" fill="url(#moa-bg)" />

        {[0, 1.6, 3.2].map((delay) => (
          <circle
            key={delay}
            cx="200"
            cy="200"
            r="150"
            fill="none"
            strokeWidth="2"
            className="eye-part eye-ring"
            style={{ stroke: 'var(--color-brand)', animationDelay: `${delay}s` }}
          />
        ))}

        <g className="eye-part eye-blink">
          <path
            d="M36 200 Q200 62 364 200 Q200 338 36 200 Z"
            fill="#ffffff"
            strokeWidth="6"
            strokeLinejoin="round"
            style={{ stroke: 'var(--color-brand-dark)' }}
          />
          <g clipPath="url(#moa-eye-clip)">
            <g className="eye-look">
              <circle cx="200" cy="200" r="76" fill="url(#moa-iris)" />
              <circle
                cx="200"
                cy="200"
                r="60"
                fill="none"
                strokeWidth="14"
                strokeDasharray="2 7"
                opacity="0.25"
                style={{ stroke: '#ffffff' }}
              />
              <circle
                cx="200"
                cy="200"
                r="76"
                fill="none"
                strokeWidth="4"
                style={{ stroke: 'var(--color-brand-dark)' }}
              />
              <circle cx="200" cy="200" r="30" className="eye-part eye-pupil" style={{ fill: '#04191d' }} />
              <circle cx="224" cy="176" r="12" fill="#ffffff" opacity="0.95" />
              <circle cx="180" cy="226" r="5" fill="#ffffff" opacity="0.8" />
            </g>
          </g>
          <path
            d="M52 192 Q200 86 348 192"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.25"
            style={{ stroke: 'var(--color-brand-dark)' }}
          />
        </g>

        {[
          { x: 70, y: 84, s: 1, d: '0s' },
          { x: 322, y: 300, s: 0.75, d: '1.2s' },
          { x: 336, y: 96, s: 0.55, d: '2.4s' },
        ].map((c) => (
          <g
            key={c.d}
            className="eye-part eye-float"
            style={{ animationDelay: c.d }}
            transform={`translate(${c.x} ${c.y}) scale(${c.s})`}
          >
            <rect x="-4" y="-14" width="8" height="28" rx="3" style={{ fill: 'var(--color-brand)' }} opacity="0.55" />
            <rect x="-14" y="-4" width="28" height="8" rx="3" style={{ fill: 'var(--color-brand)' }} opacity="0.55" />
          </g>
        ))}
      </svg>

      {/* Chips: fade out as the eye shrinks in scroll mode.
          Hidden on phones, where the eye is a small icon-sized graphic. */}
      <div ref={labelsRef} aria-hidden="true" className="hidden md:block">
        <div className="eye-float absolute right-0 top-8 rounded-2xl border border-line bg-white px-4 py-2.5 shadow-[0_12px_30px_-18px_rgba(11,122,130,0.6)]">
          <div className="text-xs text-muted">Goal</div>
          <div className="font-display text-sm font-bold text-brand-dark">Clear vision for all</div>
        </div>
        <div
          className="eye-float absolute bottom-6 left-0 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 shadow-[0_12px_30px_-18px_rgba(11,122,130,0.6)]"
          style={{ animationDelay: '1.5s' }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-mint ring-4 ring-tint" />
          <span className="font-display text-sm font-bold text-brand-dark">Primary eye care</span>
        </div>
      </div>
    </>
  );
}

export default function ScrollEye() {
  const [mode, setMode] = useState<Mode>('pending');
  const [heroSlot, setHeroSlot] = useState<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  // Decide the mode: phones and reduced-motion users get a plain inline eye
  useEffect(() => {
    setHeroSlot(document.querySelector<HTMLElement>('[data-eye-slot="hero"]'));

    const phone = window.matchMedia('(max-width: 767px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMode(phone.matches || reduce.matches ? 'inline' : 'scroll');

    update();
    phone.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      phone.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  // Scroll-linked movement (tablet and desktop only)
  useEffect(() => {
    if (mode !== 'scroll') return;
    const box = boxRef.current;
    const hero = document.querySelector<HTMLElement>('[data-eye-slot="hero"]');
    const cta = document.querySelector<HTMLElement>('[data-eye-slot="cta"]');
    if (!box || !hero) return;

    let raf = 0;

    const frame = () => {
      raf = 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const h = hero.getBoundingClientRect();

      // 1) hero -> small dock in the bottom-right corner
      const dockX = vw - DOCK - 16;
      const dockY = vh - DOCK - 16;
      const a = clamp(window.scrollY / (h.height * 0.8), 0, 1);
      const ea = ease(a);
      let x = lerp(h.left, dockX, ea);
      let y = lerp(h.top, dockY, ea);
      let w = lerp(h.width, DOCK, ea);

      // 2) dock -> big again, landing in the closing panel
      if (cta) {
        const c = cta.getBoundingClientRect();
        if (c.width > 0) {
          const b = ease(clamp((vh * 0.95 - c.top) / (vh * 0.55), 0, 1));
          x = lerp(x, c.left, b);
          y = lerp(y, c.top, b);
          w = lerp(w, c.width, b);
        }
      }

      box.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${w / BASE})`;
      box.style.visibility = 'visible';
      if (labelsRef.current) labelsRef.current.style.opacity = String(clamp(1 - a * 3, 0, 1));
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    frame();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    const ro = new ResizeObserver(request);
    ro.observe(document.body);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      ro.disconnect();
    };
  }, [mode]);

  if (mode === 'pending') return null;

  // Phone / reduced motion: the eye simply sits in the hero and scrolls with the page
  if (mode === 'inline') {
    if (!heroSlot) return null;
    return createPortal(
      <div role="img" aria-label="Illustration of a human eye" className="relative h-full w-full">
        <EyeArt />
      </div>,
      heroSlot
    );
  }

  // Tablet / desktop: one fixed eye that follows the scroll
  return (
    <div
      ref={boxRef}
      role="img"
      aria-label="Illustration of a human eye"
      className="pointer-events-none fixed left-0 top-0 z-40"
      style={{ width: BASE, height: BASE, transformOrigin: '0 0', willChange: 'transform', visibility: 'hidden' }}
    >
      <EyeArt labelsRef={labelsRef} />
    </div>
  );
}