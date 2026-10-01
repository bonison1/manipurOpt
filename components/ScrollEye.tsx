// Path: components/ScrollEye.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function EyeArt() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="moa-iris" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            style={{ stopColor: 'var(--color-mint)' }}
          />
          <stop
            offset="45%"
            style={{ stopColor: 'var(--color-brand)' }}
          />
          <stop
            offset="100%"
            style={{ stopColor: 'var(--color-brand-dark)' }}
          />
        </radialGradient>

        <radialGradient id="moa-bg" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            style={{ stopColor: '#ffffff' }}
          />
          <stop
            offset="100%"
            style={{ stopColor: 'var(--color-tint)' }}
          />
        </radialGradient>

        <clipPath id="moa-eye-clip">
          <path d="M36 200 Q200 62 364 200 Q200 338 36 200 Z" />
        </clipPath>
      </defs>

      {/* Background */}
      <circle
        cx="200"
        cy="200"
        r="190"
        fill="url(#moa-bg)"
      />

      {/* Animated rings */}
      {[0, 1.6, 3.2].map((delay) => (
        <circle
          key={delay}
          cx="200"
          cy="200"
          r="150"
          fill="none"
          strokeWidth="2"
          className="eye-part eye-ring"
          style={{
            stroke: 'var(--color-brand)',
            animationDelay: `${delay}s`,
          }}
        />
      ))}

      {/* Eye */}
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
            {/* Iris */}
            <circle
              cx="200"
              cy="200"
              r="76"
              fill="url(#moa-iris)"
            />

            {/* Iris detail */}
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

            {/* Pupil */}
            <circle
              cx="200"
              cy="200"
              r="30"
              className="eye-part eye-pupil"
              style={{ fill: '#04191d' }}
            />

            {/* Highlights */}
            <circle
              cx="224"
              cy="176"
              r="12"
              fill="#ffffff"
              opacity="0.95"
            />

            <circle
              cx="180"
              cy="226"
              r="5"
              fill="#ffffff"
              opacity="0.8"
            />
          </g>
        </g>

        {/* Upper eye highlight */}
        <path
          d="M52 192 Q200 86 348 192"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.25"
          style={{ stroke: 'var(--color-brand-dark)' }}
        />
      </g>

      {/* Floating decorative elements */}
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
          <rect
            x="-4"
            y="-14"
            width="8"
            height="28"
            rx="3"
            style={{ fill: 'var(--color-brand)' }}
            opacity="0.55"
          />

          <rect
            x="-14"
            y="-4"
            width="28"
            height="8"
            rx="3"
            style={{ fill: 'var(--color-brand)' }}
            opacity="0.55"
          />
        </g>
      ))}
    </svg>
  );
}

export default function ScrollEye() {
  const [heroSlot, setHeroSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const slot = document.querySelector<HTMLElement>(
      '[data-eye-slot="hero"]'
    );

    setHeroSlot(slot);
  }, []);

  if (!heroSlot) return null;

  return createPortal(
    <div
      role="img"
      aria-label="Illustration of a human eye"
      className="relative h-full w-full"
    >
      <EyeArt />
    </div>,
    heroSlot
  );
}
