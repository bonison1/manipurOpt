// Path: app/membership/dashboard/RegistrationCertificate.tsx
'use client';

import { useRef } from 'react';

export type CertificateData = {
  name: string; // institute / clinic name
  kindLabel: string; // "Institute" | "Eye care clinic"
  address: string;
  detailLabel: string; // e.g. "Affiliation no." / "Registration no."
  detailValue: string;
  certificateNo: string;
  issuedOn: string;
};

const W = 1123; // A4 landscape @ ~96dpi
const H = 794;
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'Arial, Helvetica, sans-serif';
const MONO = '"Courier New", Courier, monospace';

// Break text into at most `maxLines` lines of ~`max` characters (SVG has no auto-wrap).
function wrap(text: string, max: number, maxLines: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/.{0,2}$/, '…');
    return kept;
  }
  return lines;
}

export default function RegistrationCertificate(d: CertificateData) {
  const svgRef = useRef<SVGSVGElement>(null);

  const nameSize = Math.max(26, Math.min(52, Math.floor(860 / (d.name.length * 0.58))));
  const addressLines = wrap(d.address, 70, 2);

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
        a.download = `MOA-Certificate-${d.certificateNo}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup())}`;
  }

  function printCertificate() {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc) return;

    doc.open();
    doc.write(
      `<!doctype html><html><head><title>MOA Certificate ${d.certificateNo}</title>` +
        `<style>@page{size:A4 landscape;margin:0}html,body{margin:0}svg{width:297mm;height:210mm;display:block;` +
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
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl shadow-lg">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`MOA registration certificate for ${d.name}`}
        >
          <rect width={W} height={H} fill="#ffffff" />
          <rect x="24" y="24" width={W - 48} height={H - 48} fill="none" stroke="#073b66" strokeWidth="6" />
          <rect x="40" y="40" width={W - 80} height={H - 80} fill="none" stroke="#0d9488" strokeWidth="2" />

          {/* header */}
          <circle cx={W / 2} cy="118" r="42" fill="#073b66" />
          <text x={W / 2} y="128" textAnchor="middle" fontFamily={SANS} fontSize="28" fontWeight="700" fill="#ffffff">
            MOA
          </text>
          <text x={W / 2} y="205" textAnchor="middle" fontFamily={SERIF} fontSize="34" fontWeight="700" fill="#073b66">
            Manipur Optometrist Association
          </text>
          <text x={W / 2} y="236" textAnchor="middle" fontFamily={SANS} fontSize="14" letterSpacing="4" fill="#0d9488">
            SINGJAMEI CHIROM LEIKAI · IMPHAL WEST · MANIPUR
          </text>
          <line x1="260" y1="262" x2={W - 260} y2="262" stroke="#0d9488" strokeWidth="2" />

          <text x={W / 2} y="312" textAnchor="middle" fontFamily={SERIF} fontSize="30" letterSpacing="3" fill="#073b66">
            CERTIFICATE OF REGISTRATION
          </text>
          <text x={W / 2} y="356" textAnchor="middle" fontFamily={SERIF} fontSize="18" fontStyle="italic" fill="#475569">
            This is to certify that
          </text>

          {/* name + address */}
          <text x={W / 2} y="420" textAnchor="middle" fontFamily={SERIF} fontSize={nameSize} fontWeight="700" fill="#073b66">
            {d.name}
          </text>
          {addressLines.map((line, i) => (
            <text key={i} x={W / 2} y={456 + i * 24} textAnchor="middle" fontFamily={SANS} fontSize="16" fill="#475569">
              {line}
            </text>
          ))}

          <text x={W / 2} y="530" textAnchor="middle" fontFamily={SERIF} fontSize="18" fontStyle="italic" fill="#475569">
            is duly registered with the Manipur Optometrist Association as an
          </text>
          <text x={W / 2} y="566" textAnchor="middle" fontFamily={SERIF} fontSize="26" fontWeight="700" fill="#0d9488">
            {d.kindLabel}
          </text>

          {/* footer */}
          <text x="110" y="642" fontFamily={SANS} fontSize="12" letterSpacing="2" fill="#94a3b8">
            CERTIFICATE NO.
          </text>
          <text x="110" y="672" fontFamily={MONO} fontSize="24" fontWeight="700" fill="#073b66">
            {d.certificateNo}
          </text>
          <text x="110" y="706" fontFamily={SANS} fontSize="12" letterSpacing="2" fill="#94a3b8">
            {d.detailLabel.toUpperCase()}
          </text>
          <text x="110" y="728" fontFamily={SANS} fontSize="16" fontWeight="700" fill="#073b66">
            {d.detailValue}
          </text>

          <text x="480" y="642" fontFamily={SANS} fontSize="12" letterSpacing="2" fill="#94a3b8">
            ISSUED ON
          </text>
          <text x="480" y="672" fontFamily={SANS} fontSize="20" fontWeight="700" fill="#073b66">
            {d.issuedOn}
          </text>

          <line x1="800" y1="690" x2={W - 110} y2="690" stroke="#073b66" strokeWidth="1.5" />
          <text x={(800 + W - 110) / 2} y="714" textAnchor="middle" fontFamily={SANS} fontSize="14" fill="#475569">
            Authorised signatory, MOA
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-xl bg-[#0d9488] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b7d73]"
        >
          Download certificate (PNG)
        </button>
        <button
          type="button"
          onClick={printCertificate}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}