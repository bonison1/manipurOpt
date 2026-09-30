// Path: app/membership/dashboard/MemberCard.tsx
'use client';

import { useRef } from 'react';

export type CardData = {
  name: string;
  category: string;
  certificateNo: string;
  district: string;
  memberSince: string;
};

const W = 856; // credit-card ratio (85.6 x 54 mm)
const H = 540;
const SANS = 'Arial, Helvetica, sans-serif';
const MONO = '"Courier New", Courier, monospace';

export default function MemberCard({ name, category, certificateNo, district, memberSince }: CardData) {
  const svgRef = useRef<SVGSVGElement>(null);

  const displayName = name.toUpperCase();
  // shrink long names so they always fit on the card
  const nameSize = Math.max(22, Math.min(46, Math.floor(740 / (displayName.length * 0.66))));
  const chipWidth = Math.min(700, category.length * 13 + 44);

  // Standalone SVG markup (inline attributes only, so it survives export/print)
  function markup() {
    const clone = svgRef.current!.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute('class');
    clone.setAttribute('width', String(W));
    clone.setAttribute('height', String(H));
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return new XMLSerializer().serializeToString(clone);
  }

  function downloadPng() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MOA-Member-Card-${certificateNo}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup())}`;
  }

  // Prints only the card (hidden iframe), so the browser's "Save as PDF" also works
  function printCard() {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc) return;

    doc.open();
    doc.write(
      `<!doctype html><html><head><title>MOA Member Card ${certificateNo}</title>` +
        `<style>@page{margin:12mm}html,body{margin:0}svg{width:85.6mm;height:54mm;display:block;` +
        `-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${markup()}</body></html>`
    );
    doc.close();

    const cleanup = () => iframe.remove();
    win.onafterprint = cleanup;
    setTimeout(cleanup, 60_000);
    setTimeout(() => {
      win.focus();
      win.print();
    }, 150);
  }

  return (
    <div className="grid gap-4">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[28px] shadow-lg">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`MOA membership card for ${name}`}
        >
          <defs>
            <clipPath id="moa-card-clip">
              <rect width={W} height={H} rx="28" />
            </clipPath>
          </defs>

          <g clipPath="url(#moa-card-clip)">
            <rect width={W} height={H} fill="#073b66" />
            <circle cx="770" cy="110" r="150" fill="#0d9488" fillOpacity="0.2" />
            <circle cx="840" cy="480" r="130" fill="#0d9488" fillOpacity="0.14" />
            <rect x="0" y="0" width="14" height={H} fill="#0d9488" />

            {/* header */}
            <circle cx="98" cy="92" r="46" fill="#ffffff" />
            <text x="98" y="102" textAnchor="middle" fontFamily={SANS} fontSize="30" fontWeight="700" fill="#073b66">
              MOA
            </text>
            <text x="166" y="84" fontFamily={SANS} fontSize="30" fontWeight="700" fill="#ffffff">
              Manipur Optometrist Association
            </text>
            <text x="166" y="118" fontFamily={SANS} fontSize="17" letterSpacing="4" fill="#5eead4">
              MEMBERSHIP CARD
            </text>
            <line x1="56" y1="158" x2="800" y2="158" stroke="#0d9488" strokeWidth="2" />

            {/* member */}
            <text x="56" y="204" fontFamily={SANS} fontSize="14" letterSpacing="2" fill="#94a3b8">
              MEMBER NAME
            </text>
            <text x="56" y="252" fontFamily={SANS} fontSize={nameSize} fontWeight="700" fill="#ffffff">
              {displayName}
            </text>

            <rect x="56" y="276" width={chipWidth} height="40" rx="20" fill="#0d9488" />
            <text x={56 + chipWidth / 2} y="303" textAnchor="middle" fontFamily={SANS} fontSize="20" fontWeight="700" fill="#ffffff">
              {category}
            </text>

            {/* certificate */}
            <text x="56" y="368" fontFamily={SANS} fontSize="14" letterSpacing="2" fill="#94a3b8">
              CERTIFICATE NO.
            </text>
            <text x="56" y="410" fontFamily={MONO} fontSize="38" fontWeight="700" fill="#ffffff">
              {certificateNo}
            </text>

            {/* details */}
            <text x="56" y="452" fontFamily={SANS} fontSize="14" letterSpacing="2" fill="#94a3b8">
              DISTRICT
            </text>
            <text x="56" y="482" fontFamily={SANS} fontSize="24" fontWeight="700" fill="#ffffff">
              {district}
            </text>
            <text x="430" y="452" fontFamily={SANS} fontSize="14" letterSpacing="2" fill="#94a3b8">
              MEMBER SINCE
            </text>
            <text x="430" y="482" fontFamily={SANS} fontSize="24" fontWeight="700" fill="#ffffff">
              {memberSince}
            </text>

            <text x="56" y="522" fontFamily={SANS} fontSize="13" fill="#94a3b8">
              Manipur Optometrist Association · Imphal West, Manipur
            </text>
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-xl bg-[#0d9488] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b7d73]"
        >
          Download card (PNG)
        </button>
        <button
          type="button"
          onClick={printCard}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}