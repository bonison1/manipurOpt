// Path: components/admin/HeroEditor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { SubmitButton, PendingOverlay } from '@/components/admin/SubmitButton';

type Values = {
  title: string;
  tagline: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  initial: Values;
  imageUrl: string | null;
};

const MAX_BYTES = 1024 * 1024;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const input = 'mt-1 w-full rounded-lg border px-3 py-2 text-sm';
const label = 'block text-xs font-semibold text-slate-500';

export default function HeroEditor({ action, initial, imageUrl }: Props) {
  const [v, setV] = useState<Values>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Local preview of the chosen photo (nothing is uploaded until Save is pressed)
  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  const previewSrc = objectUrl ?? imageUrl;

  const fileProblem = file
    ? !OK_TYPES.includes(file.type)
      ? 'Only JPG, PNG or WebP files are allowed.'
      : file.size >= MAX_BYTES
        ? `This photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. It must be under 1 MB.`
        : null
    : null;

  function clearFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <form action={action} className="space-y-6">
      <PendingOverlay text="Saving hero..." />

      {/* Live preview, laid out like the homepage hero */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-bold text-[#073b66]">Preview</h2>
          {file && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Not saved yet
            </span>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-white">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-right"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />

          <div className="relative px-5 py-8 sm:px-10 sm:py-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo1.png" alt="" className="h-12 w-12 object-contain sm:h-16 sm:w-16" />

            <div className="mt-3 max-w-md font-display text-2xl font-extrabold leading-tight tracking-tight text-brand sm:text-4xl">
              {v.title || 'Heading'}
            </div>

            {v.tagline && (
              <p className="mt-2 max-w-md font-display text-sm font-bold leading-snug text-ink sm:text-lg">
                {v.tagline}
              </p>
            )}

            {((v.cta1Label && v.cta1Href) || (v.cta2Label && v.cta2Href)) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {v.cta1Label && v.cta1Href && (
                  <span className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white sm:text-sm">
                    {v.cta1Label}
                  </span>
                )}
                {v.cta2Label && v.cta2Href && (
                  <span className="rounded-lg border-2 border-brand px-4 py-2 text-xs font-bold text-brand sm:text-sm">
                    {v.cta2Label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {!previewSrc && (
          <p className="mt-2 text-xs text-slate-500">
            No custom photo yet. The homepage is using the first banner photo, or <code>/public/hero.jpg</code>.
          </p>
        )}
      </div>

      {/* Text */}
      <div className="space-y-3">
        <h2 className="font-bold text-[#073b66]">Text</h2>

        <label className={label}>
          Heading
          <input name="title" required value={v.title} onChange={set('title')} className={input} />
        </label>

        <label className={label}>
          Tagline (leave empty to hide)
          <input name="tagline" value={v.tagline} onChange={set('tagline')} className={input} />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Button 1 text (empty hides it)
            <input name="cta1_label" value={v.cta1Label} onChange={set('cta1Label')} className={input} />
          </label>
          <label className={label}>
            Button 1 link
            <input
              name="cta1_href"
              value={v.cta1Href}
              onChange={set('cta1Href')}
              placeholder="/membership"
              className={input}
            />
          </label>
          <label className={label}>
            Button 2 text (empty hides it)
            <input name="cta2_label" value={v.cta2Label} onChange={set('cta2Label')} className={input} />
          </label>
          <label className={label}>
            Button 2 link
            <input
              name="cta2_href"
              value={v.cta2Href}
              onChange={set('cta2Href')}
              placeholder="/about"
              className={input}
            />
          </label>
        </div>
      </div>

      {/* Photo */}
      <div className="space-y-2">
        <h2 className="font-bold text-[#073b66]">Background photo</h2>

        <label className={label}>
          {imageUrl ? 'Replace photo (optional)' : 'Upload photo (optional)'} - JPG, PNG or WebP, under 1 MB
          <input
            ref={fileRef}
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm"
          />
        </label>

        {file && (
          <button type="button" onClick={clearFile} className="text-xs font-semibold text-slate-600 underline">
            Clear chosen photo
          </button>
        )}

        {fileProblem && <p className="text-sm font-semibold text-red-600">{fileProblem}</p>}

        <p className="text-xs text-slate-500">
          Tip: use a wide landscape photo with the main subject on the right. The left side fades to white behind the
          heading.
        </p>
      </div>

      <SubmitButton
        pendingText="Saving..."
        className="rounded-lg bg-[#073b66] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Save hero
      </SubmitButton>
    </form>
  );
}